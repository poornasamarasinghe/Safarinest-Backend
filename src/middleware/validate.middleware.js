const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];
    
    for (const field in schema) {
      const rules = schema[field];
      const value = req.body[field];
      
      if (rules.required && (value === undefined || value === null || value === "")) {
        errors.push(`${field} is required`);
        continue;
      }
      
      if (value !== undefined && value !== null && value !== "") {
        if (rules.type === "number" && isNaN(Number(value))) {
          errors.push(`${field} must be a number`);
        }
        if (rules.type === "email" && !/\S+@\S+\.\S+/.test(value)) {
          errors.push(`${field} must be a valid email`);
        }
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors
      });
    }
    
    next();
  };
};

module.exports = validate;
