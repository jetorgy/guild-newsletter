// Function to extract and format content based on its structure
function formatContent(content) {
  if (!content) return '';
  
  // Split content by newlines and filter empty lines
  const lines = content.split('\n')
                      .map(line => line.trim())
                      .filter(line => line.length > 0);
  
  // Initialize content structure
  const formattedContent = {
    paragraphs: [],
    bullets: []
  };
  
  let currentParagraph = [];
  
  // Process each line
  lines.forEach(line => {
    if (line.match(/^[•\-\*]\s/)) {
      // If we were building a paragraph, save it
      if (currentParagraph.length > 0) {
        formattedContent.paragraphs.push(currentParagraph.join('<br>'));
        currentParagraph = [];
      }
      // Add bullet point
      formattedContent.bullets.push(line.replace(/^[•\-\*]\s*/, '').trim());
    } else {
      currentParagraph.push(line);
    }
  });
  
  // Save any remaining paragraph content
  if (currentParagraph.length > 0) {
    formattedContent.paragraphs.push(currentParagraph.join('<br>'));
  }
  
  // Generate appropriate HTML based on content structure
  return generateHTML(formattedContent);
}

// Generate HTML based on content structure
function generateHTML(content) {
  let html = '';
  
  // Add paragraphs if they exist
  if (content.paragraphs.length > 0) {
    content.paragraphs.forEach(paragraph => {
      html += `<p>${paragraph}</p>\n`;
    });
  }
  
  // Add bullet points if they exist
  if (content.bullets.length > 0) {
    html += '<ul>\n';
    content.bullets.forEach(bullet => {
      html += `  <li>${bullet}</li>\n`;
    });
    html += '</ul>';
  }
  
  return html;
}

// Format content based on section type
function formatByType(text, type) {
  if (!text) return '';
  
  switch(type) {
    case 'document_title':
      return `<h1>${text.trim()}</h1>`;
    case 'title':
      return `<h3>${text.trim()}</h3>`;
    case 'content':
      return formatContent(text);
    default:
      return text;
  }
}

// Extract content from document
function extractNewsletterContent(docId) {
  try {
    const doc = DocumentApp.openById(docId);
    const body = doc.getBody();
    const text = body.getText();
    
    // Initialize content object
    let content = {};
    
    // Extract all placeholders and their content
    const placeholderRegex = /{#([^}]+)}([\s\S]*?){\/\1}/g;
    let match;
    
    while ((match = placeholderRegex.exec(text)) !== null) {
      const placeholder = match[1];
      const value = match[2];
      
      // Determine the type based on the section markers
      let type = 'content';  // default type
      if (text.includes('###Document Title') && placeholder === 'document_title') {
        type = 'document_title';
      } else if (text.includes('###Titles') && text.includes(placeholder)) {
        type = 'title';
      }
      
      // Format the content based on its type
      content[placeholder] = formatByType(value, type);
    }
    
    return content;
  } catch (error) {
    Logger.log('Error extracting content: ' + error.toString());
    throw error;
  }
}

// Function to validate if all required placeholders are present
function validateContent(content) {
  const requiredFields = [
    'document_title',
    'main_content_title',
    'story_content',
    'section_title_1',
    'section_1_content',
    'section_title_2',
    'section_2_content',
    'signature'
  ];
  
  const missingFields = requiredFields.filter(field => !content[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  return true;
}

// Main function to get newsletter content
function getNewsletterContent(docId) {
  try {
    const content = extractNewsletterContent(docId);
    validateContent(content);
    return content;
  } catch (error) {
    Logger.log('Error in getNewsletterContent: ' + error.toString());
    throw error;
  }
}

// Function to extract and format content based on its structure
function testDocAccess() {
  const DOC_ID = '18BC6RADMpf0gg5ihPRloD4F8XOk2HuDB9zyLLDF-h3o';
  
  try {
    const content = getNewsletterContent(DOC_ID);
    Logger.log('Successfully extracted content:');
    Logger.log(content);
    return content;
  } catch (error) {
    Logger.log('Error testing document access:');
    Logger.log(error);
    throw error;
  }
} 