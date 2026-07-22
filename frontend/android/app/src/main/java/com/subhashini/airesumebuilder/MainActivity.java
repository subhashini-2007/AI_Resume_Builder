package com.subhashini.airesumebuilder;

import android.app.DownloadManager;
import android.content.ContentValues;
import android.content.Context;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.DownloadListener;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;

import com.getcapacitor.BridgeActivity;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Wait for Capacitor to initialize the bridge and the webView
        this.bridge.getWebView().post(new Runnable() {
            @Override
            public void run() {
                setupWebViewCapabilities();
            }
        });
    }

    private void setupWebViewCapabilities() {
        final WebView webView = this.bridge.getWebView();
        if (webView == null) return;

        // 1. Inject JavaScript Interface for Native Printing
        webView.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public void print() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        triggerNativePrint(webView);
                    }
                });
            }
        }, "AndroidPrint");

        // 2. Set Custom Download Listener for PDF and file download support
        webView.setDownloadListener(new DownloadListener() {
            @Override
            public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimetype, long contentLength) {
                handleFileDownload(url, mimetype);
            }
        });
    }

    private void triggerNativePrint(WebView webView) {
        try {
            PrintManager printManager = (PrintManager) getSystemService(Context.PRINT_SERVICE);
            if (printManager != null) {
                // Create a PrintDocumentAdapter from the WebView
                PrintDocumentAdapter printAdapter;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    printAdapter = webView.createPrintDocumentAdapter("AI_Resume");
                } else {
                    printAdapter = webView.createPrintDocumentAdapter();
                }
                
                String jobName = getString(R.string.app_name) + " Resume Document";
                printManager.print(jobName, printAdapter, new PrintAttributes.Builder().build());
            } else {
                Toast.makeText(MainActivity.this, "Printing service not available on this device.", Toast.LENGTH_LONG).show();
            }
        } catch (Exception e) {
            Toast.makeText(MainActivity.this, "Failed to print: " + e.getMessage(), Toast.LENGTH_LONG).show();
            e.printStackTrace();
        }
    }

    private void handleFileDownload(String url, String mimetype) {
        try {
            // Check if it's a Base64 data URL
            if (url.startsWith("data:")) {
                saveBase64File(url, mimetype);
            } else {
                // It's a standard HTTP/HTTPS link, use Android DownloadManager
                downloadViaManager(url, mimetype);
            }
        } catch (Exception e) {
            Toast.makeText(this, "Download failed: " + e.getMessage(), Toast.LENGTH_LONG).show();
            e.printStackTrace();
        }
    }

    private void downloadViaManager(String url, String mimetype) {
        try {
            Uri downloadUri = Uri.parse(url);
            DownloadManager.Request request = new DownloadManager.Request(downloadUri);
            
            // Set headers if necessary (can retrieve cookies/user-agent)
            request.setMimeType(mimetype);
            request.addRequestHeader("User-Agent", WebView.findAddress(url) != null ? url : "Android-Capacitor");
            
            // Allow media scanner to scan the downloaded file
            request.allowScanningByMediaScanner();
            
            // Set notification visibility
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            
            // Guess filename
            String fileName = "Resume_" + System.currentTimeMillis();
            if (mimetype.contains("pdf")) {
                fileName += ".pdf";
            } else if (mimetype.contains("png")) {
                fileName += ".png";
            } else if (mimetype.contains("jpeg") || mimetype.contains("jpg")) {
                fileName += ".jpg";
            } else {
                fileName += ".bin";
            }
            
            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName);
            
            DownloadManager manager = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
            if (manager != null) {
                manager.enqueue(request);
                Toast.makeText(this, "Download started: " + fileName, Toast.LENGTH_SHORT).show();
            } else {
                throw new Exception("DownloadManager not available");
            }
        } catch (Exception e) {
            Toast.makeText(this, "Failed to queue download: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    private void saveBase64File(String dataUrl, String mimetype) throws Exception {
        // Format of dataUrl is: data:<mimetype>;base64,<data>
        int colonIdx = dataUrl.indexOf(":");
        int semiColonIdx = dataUrl.indexOf(";");
        int commaIdx = dataUrl.indexOf(",");
        
        if (semiColonIdx == -1 || commaIdx == -1) {
            throw new IllegalArgumentException("Invalid data URI format");
        }
        
        String detectedMimetype = dataUrl.substring(colonIdx + 1, semiColonIdx);
        String base64Data = dataUrl.substring(commaIdx + 1);
        byte[] fileBytes = Base64.decode(base64Data, Base64.DEFAULT);
        
        String fileName = "Resume_" + System.currentTimeMillis();
        if (detectedMimetype.contains("pdf") || mimetype.contains("pdf")) {
            fileName += ".pdf";
        } else if (detectedMimetype.contains("png") || mimetype.contains("png")) {
            fileName += ".png";
        } else if (detectedMimetype.contains("jpeg") || detectedMimetype.contains("jpg") || mimetype.contains("jpeg")) {
            fileName += ".jpg";
        } else {
            fileName += ".bin";
        }

        // On Android 10 (Q) and above, write via MediaStore to avoid requiring legacy storage permissions
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContentValues values = new ContentValues();
            values.put(MediaStore.Downloads.DISPLAY_NAME, fileName);
            values.put(MediaStore.Downloads.MIME_TYPE, detectedMimetype);
            values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
            
            Uri externalUri = MediaStore.Downloads.EXTERNAL_CONTENT_URI;
            Uri fileUri = getContentResolver().insert(externalUri, values);
            
            if (fileUri != null) {
                OutputStream os = getContentResolver().openOutputStream(fileUri);
                if (os != null) {
                    os.write(fileBytes);
                    os.close();
                    Toast.makeText(this, "File saved to Downloads: " + fileName, Toast.LENGTH_LONG).show();
                    return;
                }
            }
            throw new Exception("Failed to insert file into MediaStore");
        } else {
            // Older Android versions: save using legacy file APIs
            File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
            File file = new File(downloadsDir, fileName);
            FileOutputStream fos = new FileOutputStream(file);
            fos.write(fileBytes);
            fos.close();
            Toast.makeText(this, "File saved to Downloads: " + fileName, Toast.LENGTH_LONG).show();
        }
    }
}
