import { Metadata } from 'next';
import Favicon from '~/public/assets/images/favicon.ico';
import { getDictionary } from './dictionaries';
import DictionaryProvider from '../../providers/dictionary-provider';
import '../globals.css';

export const metadata: Metadata = {
  icons: [{ rel: 'icon', url: Favicon.src }],
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const dictionary = await getDictionary(params.lang);

  return (
    <html lang={params.lang}>
      <body>
        <DictionaryProvider dictionary={dictionary}>
          {children}
        </DictionaryProvider>
      </body>
    </html>
  );
}
