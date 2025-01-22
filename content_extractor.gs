// Function to parse variable definitions from document sections
function parseVariableDefinitions(text) {
  Logger.log('Starting variable definitions parsing');
  const definitions = {};
  const sections = text.split('###').filter(section => section.trim());
  
  Logger.log('Found sections: [' + sections.map(s => s.split('\n')[0].trim()).join(', ') + ']');
  
  sections.forEach(section => {
    const lines = section.trim().split('\n');
    const sectionName = lines[0].trim();
    
    Logger.log('Processing section: "' + sectionName + '"');
    
    // Skip the Newsletter Content section as it contains the actual content
    if (sectionName !== 'Newsletter Content') {
      lines.slice(1).forEach(line => {
        if (line.includes('=')) {
          const [varName, placeholder] = line.split('=').map(part => part.trim());
          // Store the mapping between variable name and its placeholder
          // Extract just the name between {# and }
          const placeholderName = placeholder.match(/{#([^}]+)}/)?.[1] || placeholder;
          definitions[varName] = {
            placeholder: placeholderName,
            type: sectionName
          };
          Logger.log(`Added definition - Variable: "${varName}", Placeholder: "${placeholderName}", Type: "${sectionName}"`);
        }
      });
    }
  });
  
  Logger.log('Final definitions object: ' + JSON.stringify(definitions, null, 2));
  return definitions;
}

// Function to extract content using the variable definitions
function extractContent(text, definitions) {
  Logger.log('Starting content extraction');
  const contentSections = {};
  
  // For each defined variable, find its content
  Object.entries(definitions).forEach(([varName, def]) => {
    // For content sections, use the placeholder; for titles, use the variable name
    const searchName = def.type === 'Content' ? def.placeholder : varName;
    Logger.log(`Looking for ${def.type} with pattern name "${searchName}" for variable "${varName}"`);
    
    // Log the exact pattern we're searching for
    const pattern = `{#${searchName}}([\\s\\S]*?){\\/${searchName}}`;
    Logger.log(`Using regex pattern: ${pattern}`);
    
    const regex = new RegExp(pattern, 'g');
    const match = regex.exec(text);
    
    if (match) {
      let value = match[1].trim();
      Logger.log(`Found raw content for "${varName}": "${value}"`);
      let sectionContent = '';
      
      // Format the content based on its section type
      if (def.type === 'Document Title') {
        sectionContent = `<h1>${value}</h1>`;
      } else if (def.type === 'Titles') {
        sectionContent = `<h3>${value}</h3>`;
      } else if (def.type === 'Content') {
        // Format paragraphs and bullet points
        sectionContent = formatContent(value);
      }
      
      contentSections[varName] = sectionContent;
      Logger.log(`Formatted content for "${varName}": "${sectionContent}"`);
    } else {
      Logger.log(`Warning: No content found for "${varName}" using pattern "${searchName}"`);
      // Log a snippet of the text around where we expect the content
      const textSnippet = text.substring(0, 500) + '...';
      Logger.log(`First 500 characters of text being searched: ${textSnippet}`);
    }
  });
  
  Logger.log('Final contentSections object: ' + JSON.stringify(contentSections, null, 2));
  const result = { contentSections, monthYear: getMonthYear(), year: new Date().getFullYear() };
  Logger.log('Final template data: ' + JSON.stringify(result, null, 2));
  return result;
}

// Function to format content with paragraphs and bullet points
function formatContent(content) {
  if (!content) return '';
  
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  let html = '';
  let inList = false;
  
  lines.forEach(line => {
    if (line.match(/^[•\-\*]\s/)) {
      if (!inList) {
        html += '<ul>\n';
        inList = true;
      }
      html += `  <li>${line.replace(/^[•\-\*]\s*/, '')}</li>\n`;
    } else {
      if (inList) {
        html += '</ul>\n';
        inList = false;
      }
      html += `<p>${line}</p>\n`;
    }
  });
  
  if (inList) {
    html += '</ul>\n';
  }
  
  return html;
}

// Main function to extract newsletter content
function getNewsletterContent(docId) {
  try {
    const doc = DocumentApp.openById(docId);
    const text = doc.getBody().getText();
    
    Logger.log('Full document text:');
    Logger.log(text);
    
    // First parse the variable definitions
    const definitions = parseVariableDefinitions(text);
    
    // Then extract content using those definitions
    return extractContent(text, definitions);
  } catch (error) {
    Logger.log('Error in getNewsletterContent: ' + error.toString());
    throw error;
  }
}

// Function to get the current month and year
function getMonthYear() {
  const date = new Date();
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[date.getMonth()] + " " + date.getFullYear();
}

// Function to test document access
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