import swaggerJSDoc from "swagger-jsdoc";
import config from "./config";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Playable Ads SaaS API",
    version: "1.0.0",
    description: "Backend API for creating and rendering playable ads with video processing capabilities",
    contact: {
      name: "API Support",
      email: "support@playableads.com",
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}${config.prefix}`,
      description: "Development server",
    },
    {
      url: `https://api.playableads.com${config.prefix}`,
      description: "Production server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          email: { type: "string", format: "email" },
          name: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Project: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          description: { type: "string" },
          userId: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Asset: {
        type: "object",
        properties: {
          id: { type: "integer" },
          projectId: { type: "integer" },
          filename: { type: "string" },
          originalName: { type: "string" },
          path: { type: "string" },
          mimeType: { type: "string" },
          size: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Job: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          projectId: { type: "integer" },
          status: {
            type: "string",
            enum: ["pending", "processing", "done", "failed"],
          },
          progress: { type: "integer", minimum: 0, maximum: 100 },
          outputPath: { type: "string", nullable: true },
          error: { type: "string", nullable: true },
          startedAt: { type: "string", format: "date-time", nullable: true },
          completedAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Analytics: {
        type: "object",
        properties: {
          id: { type: "integer" },
          projectId: { type: "integer" },
          eventType: {
            type: "string",
            enum: ["play", "click", "impression", "conversion", "error"],
          },
          metadata: { type: "object", nullable: true },
          userAgent: { type: "string", nullable: true },
          ipAddress: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              message: { type: "string" },
              status: { type: "integer" },
            },
          },
        },
      },
    },
  },
  tags: [
    { name: "Auth", description: "Authentication endpoints" },
    { name: "Projects", description: "Project management endpoints" },
    { name: "Assets", description: "Asset upload and management" },
    { name: "Jobs", description: "Render job management" },
    { name: "Analytics", description: "Analytics tracking" },
  ],
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "name"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 6 },
                  name: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        user: { $ref: "#/components/schemas/User" },
                        token: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          409: { description: "User already exists" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        user: { $ref: "#/components/schemas/User" },
                        token: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/projects": {
      get: {
        tags: ["Projects"],
        summary: "Get all projects for authenticated user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Projects retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Project" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Projects"],
        summary: "Create a new project",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "description"],
                properties: {
                  title: { type: "string", minLength: 1, maxLength: 255 },
                  description: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Project created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    data: { $ref: "#/components/schemas/Project" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/projects/{id}/assets": {
      post: {
        tags: ["Assets"],
        summary: "Upload an asset to a project",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
            description: "Project ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: {
                    type: "string",
                    format: "binary",
                    description: "Image or video file",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Asset uploaded successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    data: { $ref: "#/components/schemas/Asset" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/projects/{id}/render": {
      post: {
        tags: ["Jobs"],
        summary: "Trigger a render job for a project",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
            description: "Project ID",
          },
        ],
        responses: {
          202: {
            description: "Render job queued successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        jobId: { type: "string", format: "uuid" },
                        status: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/jobs/{id}": {
      get: {
        tags: ["Jobs"],
        summary: "Get job status",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Job ID",
          },
        ],
        responses: {
          200: {
            description: "Job status retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    data: { $ref: "#/components/schemas/Job" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/analytics": {
      post: {
        tags: ["Analytics"],
        summary: "Log an analytics event",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["projectId", "eventType"],
                properties: {
                  projectId: { type: "integer" },
                  eventType: {
                    type: "string",
                    enum: ["play", "click", "impression", "conversion", "error"],
                  },
                  metadata: { type: "object" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Analytics event logged successfully",
          },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: [], // We're defining everything inline above
};

export const swaggerSpec = swaggerJSDoc(options);
