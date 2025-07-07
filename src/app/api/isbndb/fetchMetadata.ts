// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetchMetadata = async (isbn: string): Promise<any> => {
  const headers = new Headers();
  console.log("HELLO")
  console.log(process.env.NEXT_PUBLIC_ISBN_DB_API_KEY)
  headers.set("Authorization", `${process.env.NEXT_PUBLIC_ISBN_DB_API_KEY}`);
  headers.set("Content-Type", "application/json");

  console.log(headers)
  const response = await fetch(`https://api2.isbndb.com/book/${isbn}`, {
    method: "GET",
    headers: headers,
  });

  const result = await response.json();

  console.log(result);

  return {
    book: result.book,
  };
};
