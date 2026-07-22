import ResumeEditorClient from './ResumeEditorClient';

export function generateStaticParams() {
  return [{ id: 'edit' }];
}

export default function Page() {
  return <ResumeEditorClient />;
}
