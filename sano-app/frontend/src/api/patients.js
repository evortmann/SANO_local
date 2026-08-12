const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = "Não foi possível gravar o paciente localmente.";
    try {
      const body = await response.json();
      message = body.message || body.error || message;
    } catch {
      // Mantém a mensagem segura caso a API não retorne JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const patientsApi = {
  list: () => request("/api/patients"),
  create: (data) => request("/api/patients", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id, data) => request(`/api/patients/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
};
