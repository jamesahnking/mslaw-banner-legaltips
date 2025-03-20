export interface IResourceItem {
    Id: number;
    Title:string;
    Text: string;
    ResourceLink: string;
    // SortOrder: number;
    // IsActive: boolean;
    
    // Add fields for rich text content
    HeaderContent?: string;
    BodyContent?: string;
  }