"use client"

import { fetchMetadataAction } from "@/app/actions"

export function SearchBook({}: {}) {
    return (
        <form action={fetchMetadataAction}>
            <input type="text" name="isbn"/>
            <button type="submit">Search Book</button>
        </form>
    )
}