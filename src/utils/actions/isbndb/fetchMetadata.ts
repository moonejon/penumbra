// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetchMetadata = async (isbn: string): Promise<any> => {
  // Log the incoming request to track which ISBNs are being processed
  console.log(`[ISBN API] Starting fetch for ISBN: ${isbn}`);
  console.log(`[ISBN API] Timestamp: ${new Date().toISOString()}`);

  const headers = new Headers();
  headers.set("Authorization", `${process.env.NEXT_PUBLIC_ISBN_DB_API_KEY}`);
  headers.set("Content-Type", "application/json");

  // Log API key status (without exposing the actual key)
  const hasApiKey = !!process.env.NEXT_PUBLIC_ISBN_DB_API_KEY;
  console.log(`[ISBN API] API key present: ${hasApiKey}`);
  if (!hasApiKey) {
    console.error(`[ISBN API] Missing API key - this will likely fail`);
  }

  try {
    const apiUrl = `https://api2.isbndb.com/book/${isbn}`;
    console.log(`[ISBN API] Fetching URL: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: headers,
    });

    // Log response details before processing
    console.log(`[ISBN API] Response status: ${response.status}`);
    console.log(`[ISBN API] Response status text: ${response.statusText}`);
    console.log(
      `[ISBN API] Response headers:`,
      Object.fromEntries(response.headers.entries()),
    );

    // Check if response is successful
    if (!response.ok) {
      console.error(
        `[ISBN API] HTTP error: ${response.status} ${response.statusText}`,
      );
      // Log response body for debugging failed requests
      const errorText = await response.text();
      console.error(`[ISBN API] Error response body:`, errorText);
      throw new Error(
        `ISBN API returned ${response.status}: ${response.statusText}`,
      );
    }

    const result = await response.json();

    // Log successful response structure (but not full content for privacy)
    console.log(`[ISBN API] Success - response has book data:`, !!result.book);
    if (result.book) {
      console.log(
        `[ISBN API] Book title found: ${result.book.title || "No title"}`,
      );
    } else {
      console.warn(`[ISBN API] No book data in response for ISBN: ${isbn}`);
    }

    console.log(`[ISBN API] Fetch completed successfully for ISBN: ${isbn}`);

    return {
      book: result.book,
    };
  } catch (error: unknown) {
    // Log detailed error information
    console.error(`[ISBN API] Fetch failed for ISBN: ${isbn}`);

    if (error instanceof Error) {
      console.error(`[ISBN API] Error type: ${error.constructor.name}`);
      console.error(`[ISBN API] Error message: ${error.message}`);
      console.error(`[ISBN API] Full error:`, error);
    } else {
      console.error(`[ISBN API] Non-Error thrown:`, error);
    }

    // Re-throw the error so calling code can handle it
    throw error;
  }
};
