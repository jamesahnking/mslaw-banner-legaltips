import { WebPartContext } from "@microsoft/sp-webpart-base";
import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";
import { IResourceItem } from "../models/IResourceItem";

// Define an interface for SharePoint list items to avoid using 'any'
interface ISPListItem {
  ID: number;
  Title: string;
  Text: string;
  ResourceLink?: string;
  HeaderContent?: string;
  BodyContent?: string;
  [key: string]: unknown; // For any other properties that might be present
}

export class SPService {
  private _listName: string;
  private _context: WebPartContext;

  // Init the service with the current context
  constructor(context: WebPartContext, listName?: string) {
    this._context = context;
    this._listName = listName || "ContainerList";
  }
  // Set the List Name
  public setListName(listName: string): void {
    this._listName = listName;
  }

  // Get content by the List Name
  public async getResources(): Promise<IResourceItem[]> {
    const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this._listName}')/items`;

    try {
      const response: SPHttpClientResponse =
        await this._context.spHttpClient.get(
          endpoint,
          SPHttpClient.configurations.v1,
          {
            headers: {
              Accept: "application/json;odata=nometadata",
              "odata-version": "",
            },
          }
        );

      if (!response.ok) {
        throw new Error(
          `HTTP error ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();

      return data.value.map((item: ISPListItem) => ({
        Id: item.ID,
        Title: item.Title || "", // Ensure Title is not undefined
        Text: item.Text || "", // Ensure Text is not undefined
        ResourceLink: item.ResourceLink || "",
        HeaderContent: item.HeaderContent || "",
        BodyContent: item.BodyContent || "",
      }));
    } catch (error) {
      console.error("Error fetching resources:", error);
      throw error;
    }
  }

  // Get content by ID
  // Add a method to fetch a specific item by ID in the list
  public async getContentById(id: number): Promise<IResourceItem | undefined> {
    if (!id) return undefined;

    const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this._listName}')/items(${id})`;

    try {
      const response: SPHttpClientResponse =
        await this._context.spHttpClient.get(
          endpoint,
          SPHttpClient.configurations.v1,
          {
            headers: {
              Accept: "application/json;odata=nometadata",
              "odata-version": "",
            },
          }
        );

      if (!response.ok) {
        throw new Error(
          `HTTP error ${response.status}: ${response.statusText}`
        );
      }

      const item = await response.json();

      return {
        Id: item.ID,
        Title: item.Title || "", // Ensure Title is not undefined
        Text: item.Text || "",
        ResourceLink: item.ResourceLink || "",
        HeaderContent: item.HeaderContent || "",
        BodyContent: item.BodyContent || "",
      };
    } catch (error) {
      console.error("Error fetching item:", error);
      return undefined;
    }
  }
}

