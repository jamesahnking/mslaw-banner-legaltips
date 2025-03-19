export interface IResourceItem {
    Id: number;
    Text: string;
    ResourceLink: string;
    // SortOrder: number;
    // IsActive: boolean;
    
    // Add fields for rich text content
    HeaderContent?: string;
    BodyContent?: string;
  }