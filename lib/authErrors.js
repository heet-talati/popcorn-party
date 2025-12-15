export function getErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/invalid-credential":
      return "Incorrect email or password.";

    case "auth/user-disabled":
      return "Your account has been disabled.";
      
    case "auth/email-already-in-use":
      return "An account with this email already exists.";

    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/weak-password":
      return "Password must be at least 6 characters long.";

    case "auth/too-many-requests":
      return "Too many attempts. Please wait a bit and try again.";

    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";

    default:
      return "Something went wrong. Please try again.";
    }
}