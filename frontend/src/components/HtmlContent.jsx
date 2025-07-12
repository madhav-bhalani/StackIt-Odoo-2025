import React from 'react';
import { Box } from '@chakra-ui/react';

const HtmlContent = ({ content, ...props }) => {
  return (
    <Box
      dangerouslySetInnerHTML={{ __html: content }}
      className="rich-text-content"
      sx={{
        '& h1, & h2, & h3, & h4, & h5, & h6': {
          margin: '1rem 0 0.5rem 0',
          fontWeight: '600',
          lineHeight: '1.3',
        },
        '& h1': { fontSize: '1.875rem' },
        '& h2': { fontSize: '1.5rem' },
        '& h3': { fontSize: '1.25rem' },
        '& h4': { fontSize: '1.125rem' },
        '& h5': { fontSize: '1rem' },
        '& h6': { fontSize: '0.875rem' },
        '& p': {
          margin: '0.5rem 0',
          lineHeight: '1.6',
        },
        '& ul, & ol': {
          margin: '0.5rem 0',
          paddingLeft: '1.5rem',
        },
        '& li': {
          margin: '0.25rem 0',
        },
        '& blockquote': {
          borderLeft: '4px solid #e5e7eb',
          margin: '1rem 0',
          paddingLeft: '1rem',
          fontStyle: 'italic',
          color: '#6b7280',
        },
        '& code': {
          backgroundColor: '#f3f4f6',
          padding: '0.125rem 0.25rem',
          borderRadius: '0.25rem',
          fontFamily: "'Courier New', monospace",
          fontSize: '0.875rem',
        },
        '& pre': {
          backgroundColor: '#f3f4f6',
          padding: '1rem',
          borderRadius: '0.5rem',
          overflowX: 'auto',
          margin: '1rem 0',
        },
        '& pre code': {
          backgroundColor: 'transparent',
          padding: '0',
        },
        '& a': {
          color: '#714B67',
          textDecoration: 'underline',
        },
        '& a:hover': {
          color: '#5a3b52',
        },
        '& img': {
          maxWidth: '100%',
          height: 'auto',
          borderRadius: '0.5rem',
          margin: '1rem 0',
        },
        '& .text-left': { textAlign: 'left' },
        '& .text-center': { textAlign: 'center' },
        '& .text-right': { textAlign: 'right' },
      }}
      {...props}
    />
  );
};

export default HtmlContent; 