// import so I can strongly type the error the function gets
import { ValidationError } from "yup";

// interface to type the function's return
// the key keyword says that the key can be anything as long as it is a string. It can also be multiple strings
interface Errors {
  [key: string]: string;
}

/**
 * this is an auxiliary function that receives all errors of type ValidationError,
 * then it it access the inner element of each error and creates an object with the path to the input element and the error message.
 * Lastly, it return the object
 */
export default function getValidationErrors(err: ValidationError): Errors {
  const validationErrors: Errors = {};

  // inner is an array that contains details about all errors
  err.inner.forEach((error) => {
    /**
     * this creates an object like
     * {
     *    componentName: 'error message'
     * }
     */
    validationErrors[error.path] = error.message;
    /**
     * the return of this function will look like this:
     * email: "You must enter an email"
     * name: "You must enter an email"
     * password: "Password needs to be at least 6 characters"
     */
  });

  return validationErrors;
}
