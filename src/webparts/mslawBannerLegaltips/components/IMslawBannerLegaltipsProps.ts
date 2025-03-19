import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IResourceItem } from "..//models/IResourceItem";


export interface IMslawBannerLegaltipsProps {
  description: string;
  listName: string;
  headerText: string;
  bodyText: string;
  titleText: string; // Optional title for the web part
  context: WebPartContext;

  HeaderContent?: string;
  BodyContent?: string;

  // For list-based resources
  resources?: IResourceItem[];
  isLoading?: boolean;

  //Properties for content selection
  useListContent: boolean;
  contentItemId: number;

  onPropertyPaneFieldChanged: (
    propertyPath: string,
    newValue: string | number | boolean
  ) => void;
}
