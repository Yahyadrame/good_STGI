import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const response = await fetch(`http://localhost:5000/api/steps/${id}`, {
      headers: { "Content-Type": "application/json" },
    });
    const text = await response.text();
    const log = process.env.NODE_ENV === "development" ? console.log : () => {};
    log(`[DEBUG] Backend response for /steps/${id}: Status ${response.status}, Body: ${text}`);
    if (!response.ok) {
      console.error(`[ERROR] Backend failed for /steps/${id}: ${text} (Status: ${response.status})`);
      return NextResponse.json({ error: "Step not found" }, { status: response.status });
    }
    const data = JSON.parse(text);
    const normalizedData = {
      id: data.id?.toString() || id,
      instructionId: data.instructionId?.toString() || "",
      action: data.action?.toString() || "",
      component: data.component?.toString() || null,
      location: data.location?.toString() || null,
      toolId: data.toolId?.toString() || null,
      details: data.details?.toString() || "",
      objective: data.objective?.toString() || "",
      media: data.media?.toString() || null,
      createdAt: data.createdAt || null,
      updatedAt: data.updatedAt || null,
    };
    return NextResponse.json(normalizedData);
  } catch (error) {
    console.error("Error fetching step:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json({ error: "Unsupported Content-Type" }, { status: 400 });
    }
    const body = await request.json();
    const { instructionId, action, component, location, toolId, details, objective } = body;

    if (!instructionId || !action || !details || !objective) {
      return NextResponse.json(
        { error: "instructionId, action, details, and objective are required" },
        { status: 400 }
      );
    }

    const dataToSend = {
      instructionId: instructionId.toString(),
      action: action.toString(),
      component: component?.toString() || null,
      location: location?.toString() || null,
      toolId: toolId?.toString() || null,
      details: details?.toString() || "",
      objective: objective?.toString() || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const backendResponse = await fetch("http://localhost:5000/api/steps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.text();
      console.error("Backend error creating step:", errorData);
      throw new Error("Failed to create step on backend");
    }

    const result = await backendResponse.json();
    const normalizedResult = {
      id: result.id?.toString() || "",
      instructionId: result.instructionId?.toString() || "",
      action: result.action?.toString() || "",
      component: result.component?.toString() || null,
      location: result.location?.toString() || null,
      toolId: result.toolId?.toString() || null,
      details: result.details?.toString() || "",
      objective: result.objective?.toString() || "",
      media: result.media?.toString() || null,
      createdAt: result.createdAt || null,
      updatedAt: result.updatedAt || null,
    };
    return NextResponse.json(normalizedResult, { status: 201 });
  } catch (error) {
    console.error("Error creating step:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const contentType = request.headers.get("content-type");
    let dataToSend;
    if (contentType?.includes("application/json")) {
      const body = await request.json();
      const { instructionId, action, component, location, toolId, details, objective } = body;
      if (!instructionId || !action || !details || !objective) {
        return NextResponse.json(
          { error: "instructionId, action, details, and objective are required" },
          { status: 400 }
        );
      }
      dataToSend = {
        instructionId: instructionId.toString(),
        action: action.toString(),
        component: component?.toString() || null,
        location: location?.toString() || null,
        toolId: toolId?.toString() || null,
        details: details?.toString() || "",
        objective: objective?.toString() || "",
        updatedAt: new Date().toISOString(),
      };
    } else if (contentType?.includes("multipart/form-data")) {
      const formData = await request.formData();
      dataToSend = formData;
    } else {
      return NextResponse.json({ error: "Unsupported Content-Type" }, { status: 400 });
    }

    const backendResponse = await fetch(`http://localhost:5000/api/steps/${id}`, {
      method: "PATCH",
      body: dataToSend instanceof FormData ? dataToSend : JSON.stringify(dataToSend),
      headers: dataToSend instanceof FormData ? {} : { "Content-Type": "application/json" },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.text();
      console.error("Backend error updating step:", errorData);
      return NextResponse.json({ error: "Step not found" }, { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    const normalizedData = {
      id: data.id?.toString() || id,
      instructionId: data.instructionId?.toString() || "",
      action: data.action?.toString() || "",
      component: data.component?.toString() || null,
      location: data.location?.toString() || null,
      toolId: data.toolId?.toString() || null,
      details: data.details?.toString() || "",
      objective: data.objective?.toString() || "",
      media: data.media?.toString() || null,
      createdAt: data.createdAt || null,
      updatedAt: data.updatedAt || null,
    };
    return NextResponse.json(normalizedData);
  } catch (error) {
    console.error("Error updating step:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH_REORDER(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch("http://localhost:5000/api/steps/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorData = await response.text();
      console.error("Backend error reordering steps:", errorData);
      return NextResponse.json({ error: "Error updating step order" }, { status: response.status });
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating step order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}