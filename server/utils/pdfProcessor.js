const fs = require('fs');
const path = require('path');

// Simple PDF text extraction utility
// Requirements: npm install pdf-parse multer

const pdfParse = require('pdf-parse');

/**
 * Extract questions from PDF text
 * Supports multiple formats:
 * 1. Question? A) Option B) Option C) Option D) Option Answer: A
 * 2. Question? a) option b) option c) option d) option Correct: a
 * 3. Q1: Question? (A) Option (B) Option (C) Option (D) Option Answer: A
 */
const parseQuestionsFromPDF = (text) => {
  const questions = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  console.log('🔍 PDF Lines extracted:', lines.length);
  console.log('First 15 lines:', lines.slice(0, 15));
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    // Check if this line is a question (starts with number. or Q)
    const questionMatch = line.match(/^(?:\d+\.|Q\d+[:.\)]?)\s*(.+?)[\?\!]?$/i);
    
    if (questionMatch) {
      const questionText = questionMatch[1].trim();
      console.log(`📝 Found question: ${questionText}`);
      
      // Look ahead for the next 4 lines as options
      const options = [];
      let j = i + 1;
      
      while (j < lines.length && options.length < 4) {
        const potentialOption = lines[j];
        
        // Stop if we hit another question
        if (potentialOption.match(/^(?:\d+\.|Q\d+[:.\)]?)\s*(.+?)[\?\!]?$/i)) {
          break;
        }
        
        // Skip only certain header lines, but allow short options like "Au", "7", etc.
        if (potentialOption.match(/^(please|answer|correct|ans|select|the following|for each)/i)) {
          j++;
          continue;
        }
        
        options.push({
          optionText: potentialOption,
          letter: String.fromCharCode(65 + options.length), // A, B, C, D
          isCorrect: options.length === 0 // Default first option as correct
        });
        
        console.log(`  └─ Option ${String.fromCharCode(65 + options.length - 1)}: ${potentialOption}`);
        j++;
      }
      
      // Only add question if we found exactly 4 options
      if (options.length === 4) {
        questions.push({
          questionText: questionText,
          options: options.map(opt => ({
            optionText: opt.optionText,
            isCorrect: opt.isCorrect
          })),
          marks: 1,
          difficulty: 'medium',
          explanation: ''
        });
        console.log(`✅ Saved question with ${options.length} options`);
      } else {
        console.log(`⚠️  Skipped question - only found ${options.length} options (need 4)`);
      }
      
      i = j;
    } else {
      i++;
    }
  }

  console.log(`\n📊 Total questions parsed: ${questions.length}`);
  return questions;
};

/**
 * Extract text from PDF buffer
 */
const extractTextFromPDF = async (pdfBuffer) => {
  try {
    const data = await pdfParse(pdfBuffer);
    return data.text;
  } catch (error) {
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
};

module.exports = {
  parseQuestionsFromPDF,
  extractTextFromPDF
};
