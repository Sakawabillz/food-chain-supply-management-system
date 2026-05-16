const Joi = require("joi");

const createShipmentSchema = Joi.object({
  batchId: Joi.string().required().messages({
    "any.required": "Batch ID is required",
    "string.empty": "Batch ID cannot be empty",
  }),
  origin: Joi.string().required().messages({
    "any.required": "Origin is required",
    "string.empty": "Origin cannot be empty",
  }),
  destination: Joi.string().required().messages({
    "any.required": "Destination is required",
    "string.empty": "Destination cannot be empty",
  }),
  transportCompany: Joi.string().optional(),
  departureDate: Joi.date().iso().required().messages({
    "any.required": "Departure date is required",
    "date.format": "Departure date must be a valid ISO date",
  }),
  arrivalDate: Joi.date().iso().optional(),
});

const validateCreateShipment = (req, res, next) => {
  const { error } = createShipmentSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const errors = error.details.map((d) => d.message);
    return res.status(400).json({ success: false, errors });
  }

  next();
};



module.exports = {
  create: {},
  validateCreateShipment,
};
