import { Request, Response } from 'express';
import { adminDb } from '../lib/firebaseAdmin';

// Default templates catalog definition
const DEFAULT_TEMPLATES = [
  {
    id: 'modern-glow',
    name: 'Modern Glow',
    description: 'A dark-mode-first aesthetic with glowing borders and vibrant indigo typography.',
    thumbnailUrl: '/templates/modern-glow.png',
    primaryColor: '#8b5cf6',
    fontFamily: 'Inter, sans-serif'
  },
  {
    id: 'minimal-slate',
    name: 'Minimal Slate',
    description: 'A clean, high-contrast light mode design built for corporate and professional roles.',
    thumbnailUrl: '/templates/minimal-slate.png',
    primaryColor: '#334155',
    fontFamily: 'system-ui, sans-serif'
  },
  {
    id: 'classic-navy',
    name: 'Classic Navy',
    description: 'Traditional styling utilizing conservative fonts and deep navy blue elements.',
    thumbnailUrl: '/templates/classic-navy.png',
    primaryColor: '#1e3a8a',
    fontFamily: 'Georgia, serif'
  }
];

export const getTemplates = async (req: Request, res: Response) => {
  // Fallback to defaults if Firestore DB is not initialized
  if (!adminDb) {
    return res.status(200).json(DEFAULT_TEMPLATES);
  }

  try {
    const snapshot = await adminDb.collection('templates').get();
    if (snapshot.empty) {
      // Seed templates if DB exists but is empty
      const batch = adminDb.batch();
      DEFAULT_TEMPLATES.forEach((tmpl) => {
        const docRef = adminDb!.collection('templates').doc(tmpl.id);
        batch.set(docRef, tmpl);
      });
      await batch.commit();
      return res.status(200).json(DEFAULT_TEMPLATES);
    }

    const templates: any[] = [];
    snapshot.forEach((doc) => {
      templates.push(doc.data());
    });
    res.status(200).json(templates);
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

export const getTemplateById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!adminDb) {
    const tmpl = DEFAULT_TEMPLATES.find((t) => t.id === id);
    if (!tmpl) {
      return res.status(404).json({ error: 'Not Found', message: 'Template not found.' });
    }
    return res.status(200).json(tmpl);
  }

  try {
    const doc = await adminDb.collection('templates').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Not Found', message: 'Template not found.' });
    }
    res.status(200).json(doc.data());
  } catch (error: any) {
    console.error('Error fetching template by ID:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};
