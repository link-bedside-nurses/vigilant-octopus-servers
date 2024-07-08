export  default class HTTPException extends Error {
  public override message: string;
  public statusCode?: number;
  public details?: string;

  constructor(message: string, statusCode?: number, details?: string) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.details = details;
  }
}
