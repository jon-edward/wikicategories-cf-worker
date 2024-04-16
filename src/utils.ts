export function toError(data: unknown, code: number): Response {
    const message = JSON.stringify(data);
    return new Response(message, {
        headers: { 'Content-Type': 'application/json' },
        status: code
    });
}

export function toSuccess(data: unknown): Response {
    const message = JSON.stringify(data);
    return new Response(message, {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    });
}