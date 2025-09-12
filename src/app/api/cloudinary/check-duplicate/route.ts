import { type NextRequest, NextResponse } from "next/server";
import cloudinary from "@/server/cloudinary";
import {
  getBaseNameFromPublicId, // Import the new helper function
  getLooseComparableName,
  getStrictComparableName,
} from "@/lib/cloudinary/utils";

// Declare the types before using them
interface CheckDuplicateRequest {
  fileName: string;
  folderName?: string;
  strictMode?: boolean;
}

interface CloudinaryResource {
  public_id: string;
  format: string;
  secure_url: string;
  resource_type: string;
  bytes: number;
  created_at: string;
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<CheckDuplicateResponse>> {
  try {
    const body: CheckDuplicateRequest = await request.json();
    const { fileName, folderName, strictMode = false } = body;

    if (!fileName) {
      return NextResponse.json(
        { exists: false, error: "File name is required" },
        { status: 400 },
      );
    }

    const fileExtension = fileName.split(".").pop()?.toLowerCase() || "";
    const incomingStrictBaseName = getStrictComparableName(fileName); // For exact match
    const incomingLooseBaseName = getLooseComparableName(fileName); // For basename match and search query

    console.log("Duplicate check for:", {
      originalFileName: fileName,
      incomingStrictBaseName,
      incomingLooseBaseName,
      fileExtension,
      folderName,
      strictMode,
    });

    try {
      // Search for files that match the loose base name pattern to cast a wider net
      const searchExpression = folderName
        ? `folder:${folderName} AND filename:${incomingLooseBaseName}*`
        : `filename:${incomingLooseBaseName}*`;

      console.log("Search expression:", searchExpression);

      const searchResult = await cloudinary.search
        .expression(searchExpression)
        .max_results(50)
        .execute();

      console.log("Search results:", {
        totalFound: searchResult.resources?.length || 0,
        resources: searchResult.resources?.map((r: CloudinaryResource) => ({
          public_id: r.public_id,
          format: r.format,
        })),
      });

      if (searchResult.resources && searchResult.resources.length > 0) {
        const exactMatches: CloudinaryResource[] = [];
        const baseNameMatches: CloudinaryResource[] = [];

        searchResult.resources.forEach((resource: CloudinaryResource) => {
          const resourceFileName = getBaseNameFromPublicId(
            resource.public_id,
            resource.format,
          );
          const resourceExtension = resource.format?.toLowerCase() || "";

          const resourceStrictBaseName = getStrictComparableName(
            resourceFileName,
          );
          const resourceLooseBaseName = getLooseComparableName(
            resourceFileName,
          );

          console.log("Analyzing resource (refined):", {
            resourceFileName,
            resourceStrictBaseName,
            resourceLooseBaseName,
            resourceExtension,
            incomingStrictBaseName,
            incomingLooseBaseName,
            fileExtension,
            extensionMatch: resourceExtension === fileExtension,
            strictBaseNameMatch:
              resourceStrictBaseName === incomingStrictBaseName,
            looseBaseNameMatch: resourceLooseBaseName === incomingLooseBaseName,
          });

          // Check for exact match: (same strict base name OR same loose base name) AND same extension
          if (
            (resourceStrictBaseName === incomingStrictBaseName ||
              resourceLooseBaseName === incomingLooseBaseName) &&
            resourceExtension === fileExtension
          ) {
            exactMatches.push(resource);
            console.log("EXACT match found:", {
              resourceFileName,
              matchType: resourceStrictBaseName === incomingStrictBaseName
                ? "strict"
                : "loose",
              sameExtension: true,
            });
          } else if (
            resourceLooseBaseName === incomingLooseBaseName &&
            resourceExtension !== fileExtension
          ) {
            // Check for basename match: same loose base name AND different extension
            baseNameMatches.push(resource);
            console.log(
              "Base name match found (same loose name + different extension):",
              {
                resourceFileName,
                resourceExtension,
                expectedExtension: fileExtension,
              },
            );
          }
        });

        // Only consider it a duplicate if there's an EXACT match (same name + same extension)
        if (exactMatches.length > 0) {
          const primaryMatch = exactMatches[0];
          console.log("TRUE DUPLICATE detected (exact match):", {
            primaryMatch: primaryMatch.public_id,
            format: primaryMatch.format,
            totalExactMatches: exactMatches.length,
          });

          return NextResponse.json({
            exists: true,
            duplicateType: "exact",
            file: {
              secure_url: primaryMatch.secure_url,
              public_id: primaryMatch.public_id,
              resource_type: primaryMatch.resource_type,
              format: primaryMatch.format,
              bytes: primaryMatch.bytes,
              created_at: primaryMatch.created_at,
            },
            allMatches: exactMatches.map((match) => ({
              secure_url: match.secure_url,
              public_id: match.public_id,
              format: match.format,
              bytes: match.bytes,
              created_at: match.created_at,
            })),
            message: `File "${fileName}" already exists (uploaded as "${
              primaryMatch.public_id
                .split("/")
                .pop()
            }.${primaryMatch.format}")`,
          });
        }

        // If we only have base name matches (different extensions), return a special response
        if (baseNameMatches.length > 0) {
          console.log(
            "ℹ️ Found files with same base name but different extensions:",
            {
              baseNameMatches: baseNameMatches.map((m) => ({
                public_id: m.public_id,
                format: m.format,
              })),
              currentFile: fileName,
              currentExtension: fileExtension,
            },
          );

          // Return basename match info for user confirmation
          return NextResponse.json({
            exists: true,
            duplicateType: "basename",
            file: baseNameMatches[0], // Return the first basename match
            allMatches: baseNameMatches.map((match) => ({
              secure_url: match.secure_url,
              public_id: match.public_id,
              format: match.format,
              bytes: match.bytes,
              created_at: match.created_at,
            })),
            message:
              `Files with similar name "${incomingStrictBaseName}" exist with different extensions: ${
                baseNameMatches
                  .map((m) => m.format)
                  .join(", ")
              }`,
          });
        }
      }

      // No duplicates found
      console.log("✅ No duplicates found for:", fileName);
      return NextResponse.json({ exists: false });
    } catch (searchError: unknown) {
      // Handle search API errors gracefully
      const error = searchError as { http_code?: number; message?: string };

      console.warn("Search API error:", searchError);

      // If it's a 404 or similar "not found" error, that means no duplicates exist
      if (error.http_code === 404) {
        return NextResponse.json({ exists: false });
      }

      // For other search errors, still allow upload to proceed
      return NextResponse.json({ exists: false });
    }
  } catch (error: unknown) {
    console.error("Cloudinary duplicate check error:", error);

    // Even on error, don't block uploads - return no duplicates found
    return NextResponse.json({ exists: false });
  }
}
