import {body} from "express-validator";

function validateRequest (req, res, next)  {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    next();

}


export const validateRegisterUser=[
    body("fullname").notEmpty().withMessage("Full name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("contact")
    .notEmpty().withMessage("Contact number is required")
    .matches(/^|d{10}$/).withMessage("Contact number must be a 10-digit number"),
    body("password").isLength({min:6}).withMessage("Password must be at least 6 characters long"),
    body("role").isIn(["buyer","seller"]).withMessage("Role must be either buyer or seller"),

    validateRequest
]