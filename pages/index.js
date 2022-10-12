import dynamic from 'next/dynamic';
import React from 'react';
const MyDocuments = dynamic(import('components/MyDocuments'), { ssr: false });

function DefaultPage() {

  return (
    <>
      <MyDocuments />
    </>
  );
}

export default DefaultPage;
