class HTTPException extends Error {
  public override error: string;
  public statusCode?: number;
  public details?: string;

  constructor(message: string, statusCode?: number, details?: string) {
    super(message);
    this.error = message;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export default HTTPException;
