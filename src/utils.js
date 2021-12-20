export function getProperty(object, propertyPath, defaultValue) {
  if (!object) {
    console.error("First argument of getProperty is required!");
    return defaultValue;
  }
  const hasCorrectTypes = !propertyPath.every(
    (p) =>
      typeof p === "string" ||
      p instanceof String ||
      typeof p === "number" ||
      p instanceof Number
  );
  if (!propertyPath || !Array.isArray(propertyPath) || hasCorrectTypes) {
    console.error(
      "Second argument of getProperty is required and should be an array of strings!"
    );
    return defaultValue;
  }

  for (const pathPart of propertyPath) {
    if (object[pathPart]) {
      object = object[pathPart];
    } else {
      object = defaultValue;
      break;
    }
  }

  return object;
}
