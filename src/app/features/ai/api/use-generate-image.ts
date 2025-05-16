import { useMutation } from "@tanstack/react-query";

type ResponseType = { data: string };
type RequestType = { prompt: string };

export const useGenerateImage = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      console.log("Sending request to /api/ai/generate-image with:", json);
      const response = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });

      console.log("Response status:", response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Response data:", data);
      return data;
    },
  });

  return mutation;
};
