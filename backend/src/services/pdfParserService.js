import * as pdfModule from 'pdf-parse';

const pdfParse = pdfModule.default || pdfModule;

/**
 * Parse PDF text to extract recipe structure
 * Attempts to identify: name, ingredients, instructions, time, servings
 */
export const parsePdfRecipe = async (pdfBuffer) => {
  try {
    const data = await pdfParse(pdfBuffer);
    const text = data.text;

    return parseRecipeText(text);
  } catch (err) {
    throw new Error(`PDF parsing failed: ${err.message}`);
  }
};

/**
 * Parse raw text to extract recipe components
 */
const parseRecipeText = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const recipe = {
    name: '',
    ingredients: [],
    instructions: [],
    time_minutes: null,
    servings: null,
    tags: [],
    source: '',
  };

  // Extract recipe name (usually first line)
  if (lines.length > 0) {
    recipe.name = lines[0];
  }

  // Look for time and servings (common patterns)
  const timeMatch = text.match(/(\d+)\s*(?:min|minute|minuten|Min)/i);
  if (timeMatch) recipe.time_minutes = parseInt(timeMatch[1]);

  const servingsMatch = text.match(/(?:servings?|portionen?|serves|für)\s*[:\s]*(\d+)/i);
  if (servingsMatch) recipe.servings = parseInt(servingsMatch[1]);

  // Extract ingredients section
  const ingredientsSectionMatch = text.match(
    /(?:zutaten?|ingredients?|Zutaten|Ingredients)[:\s]*([\s\S]*?)(?:anleitung|instructions?|schritt|steps?|zubereitung|Anleitung|Instructions|Zubereitung|$)/i
  );

  if (ingredientsSectionMatch) {
    const ingredientsText = ingredientsSectionMatch[1];
    const ingredientLines = ingredientsText.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.match(/^\d+\./));

    recipe.ingredients = ingredientLines.map(line => parseIngredientLine(line));
  }

  // Extract instructions section
  const instructionsSectionMatch = text.match(
    /(?:anleitung|instructions?|schritt|steps?|zubereitung|Anleitung|Instructions|Zubereitung)[:\s]*([\s\S]*?)$/i
  );

  if (instructionsSectionMatch) {
    const instructionsText = instructionsSectionMatch[1];
    const instructionLines = instructionsText.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .map(l => l.replace(/^[\d.)\-•*]+\s*/, '')) // Remove numbering/bullets
      .filter(l => l.length > 0);

    recipe.instructions = instructionLines;
  }

  return recipe;
};

/**
 * Parse a single ingredient line to extract name, quantity, unit
 * Examples:
 *   "500g Spaghetti" -> {name: "Spaghetti", quantity: "500", unit: "g"}
 *   "2 cups flour" -> {name: "flour", quantity: "2", unit: "cups"}
 *   "Salt to taste" -> {name: "Salt to taste", quantity: "", unit: ""}
 */
const parseIngredientLine = (line) => {
  // Remove common prefixes
  line = line.replace(/^[\d.)\-•*]\s*/, '').trim();

  // Pattern: "quantity unit name" (e.g., "500g Spaghetti")
  const pattern1 = /^([\d.,]+)\s*([a-zA-Z%]+)\s+(.+)$/;
  const match1 = line.match(pattern1);
  if (match1) {
    return {
      name: match1[3].trim(),
      quantity: match1[1].trim(),
      unit: match1[2].trim(),
    };
  }

  // Pattern: "quantity name" (e.g., "2 cups flour" or "2 Äpfel")
  const pattern2 = /^([\d.,]+)\s+(.+)$/;
  const match2 = line.match(pattern2);
  if (match2) {
    const rest = match2[2].trim();
    // Try to separate unit from name
    const unitPattern = /^([a-zA-Z%]+)\s+(.+)$/;
    const unitMatch = rest.match(unitPattern);
    if (unitMatch) {
      return {
        name: unitMatch[2].trim(),
        quantity: match2[1].trim(),
        unit: unitMatch[1].trim(),
      };
    }
    return {
      name: rest,
      quantity: match2[1].trim(),
      unit: '',
    };
  }

  // Fallback: just name
  return {
    name: line,
    quantity: '',
    unit: '',
  };
};
