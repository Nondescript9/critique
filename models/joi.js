const CustomJoi = require('joi');
const sanitizeHTML = require('sanitize-html');

const sanitizeConfig = {
  allowedTags: [],
  allowedAttributes: {}
};
// Extension method on Joi.String to sanitize HTML
const extension = (joi) => ({
  type: 'string',
  base: joi.string(),
  messages: {
    'string.escapeHTML': '{{#label}} must not include HTML'
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHTML(value, sanitizeConfig);
        if (clean !== value) return helpers.error('string.escapeHTML', { value });
        return clean;
      }
    }
  }
});

const Joi = CustomJoi.extend(extension);

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required().escapeHTML()
  }).required()
});
