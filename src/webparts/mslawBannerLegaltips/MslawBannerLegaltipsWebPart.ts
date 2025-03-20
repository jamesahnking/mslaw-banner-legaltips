import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle,
  PropertyPaneDropdown,
  IPropertyPaneDropdownOption,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart,
  WebPartContext,
 } from '@microsoft/sp-webpart-base';


import * as strings from 'MslawBannerLegaltipsWebPartStrings';
import MslawBannerLegaltips from './components/MslawBannerLegaltips';
import { IMslawBannerLegaltipsProps } from './components/IMslawBannerLegaltipsProps';
import { SPService } from "../mslawBannerLegaltips/services/SPListService";


export interface IMslawBannerLegaltipsWebPartProps {
  description: string;
  listName: string;
  headerText: string;
  bodyText: string;
  titleText: string; // Optional title for the web part
  context: WebPartContext;
  useListContent: boolean;
  contentItemId: number;
}

/**
 * MslawBannerLegaltipsWebPart is a client-side web part that provides a two-column container
 * for displaying content in a SharePoint page. It extends the BaseClientSideWebPart class
 * and implements the IMslawBannerLegaltipsWebPartProps interface for its properties.
 *
 * @class
 * @extends {BaseClientSideWebPart<IMslawBannerLegaltipsWebPartProps>}
 *
 * @property {IPropertyPaneDropdownOption[]} _listsOptions - Options for the SharePoint lists dropdown.
 * @property {IPropertyPaneDropdownOption[]} _contentItemsOptions - Options for the content items dropdown.
 * @property {SPService} _spService - Service for interacting with SharePoint.
 * @property {boolean} _listsLoaded - Flag indicating whether the lists have been loaded.
 * @property {boolean} _contentItemsLoaded - Flag indicating whether the content items have been loaded.
 *
 * @method {Promise<void>} onInit - Initializes the web part, setting default property values and initializing the SP service.
 * @method {void} render - Renders the web part using React.
 * @method {void} onDispose - Cleans up the web part when it is disposed.
 * @method {Version} dataVersion - Returns the version of the web part data.
 * @method {Promise<IPropertyPaneDropdownOption[]>} _loadLists - Loads the available SharePoint lists for the dropdown.
 * @method {Promise<void>} loadPropertyPaneResources - Loads resources for the property pane.
 * @method {IPropertyPaneConfiguration} getPropertyPaneConfiguration - Returns the configuration for the property pane.
 */


export default class MslawBannerLegaltipsWebPart extends BaseClientSideWebPart<IMslawBannerLegaltipsWebPartProps> {

  private _listsOptions: IPropertyPaneDropdownOption[] = [];
  private _contentItemsOptions: IPropertyPaneDropdownOption[] = [];
  protected _spService: SPService;
  private _listsLoaded: boolean = false;
  private _contentItemsLoaded: boolean = false;



  protected async onInit(): Promise<void> {
    // Initialize the SP service
    this._spService = new SPService(this.context);

    // Set default property values if not already set
    if (!this.properties.description) {
      this.properties.description = "Two Column Container";
    }

    if (!this.properties.headerText) {
      this.properties.headerText = "Section Header";
    }

    if (!this.properties.bodyText) {
      this.properties.bodyText = "Add your content here.";
    }

    if (!this.properties.titleText) {
      this.properties.titleText = "Add your content here.";
    }

    if (!this.properties.listName) {
      this.properties.listName = "ContainerList";
    }

    // Initialize optional properties with appropriate defaults
    this.properties.useListContent =
      this.properties.useListContent === undefined
        ? false
        : this.properties.useListContent;

    this.properties.contentItemId = this.properties.contentItemId || 0;

    return super.onInit();
  }


  public render(): void {
    const element: React.ReactElement<IMslawBannerLegaltipsProps> = React.createElement(
      MslawBannerLegaltips,
      {
        description: this.properties.description,
        listName: this.properties.listName,
        headerText: this.properties.headerText,
        bodyText: this.properties.bodyText,
        titleText: this.properties.titleText || "Legal Tips", // Optional title
        context: this.context,
        useListContent: this.properties.useListContent || false,
        // Make sure to cast contentItemId to number if needed
        contentItemId:
          typeof this.properties.contentItemId === "number"
            ? this.properties.contentItemId
            : 0,
        onPropertyPaneFieldChanged: (
          propertyPath: string,
          newValue: string | number | boolean
        ) => {
          // Type assertion is needed to safely assign the property
          const typedProperties = this.properties as unknown as {
            [key: string]: string | number | boolean;
          };
          typedProperties[propertyPath] = newValue;

          // If list name changed, reload content items
          if (propertyPath === "listName") {
            this._contentItemsLoaded = false;
            this._contentItemsOptions = [];
            this.properties.contentItemId = 0;

            // Force property pane update
            this.context.propertyPane.refresh();
          }
        },
      });

    ReactDom.render(element, this.domElement);
  }


  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

    // LOAD LISTS AND CONTENT ITEMS
    private async _loadLists(): Promise<IPropertyPaneDropdownOption[]> {
      if (this._listsLoaded) {
        return this._listsOptions;
      }
  
      try {
        // This would typically fetch available lists from SP
        this._listsOptions = [
          { key: "ContainerList", text: "Container List" },
          // { key: "ResourcesList", text: "Resources List" },
        ];
  
        this._listsLoaded = true;
        return this._listsOptions;
      } catch (error) {
        console.error("Error loading lists:", error);
        return [{ key: "ContainerList", text: "Container List (Default)" }];
      }
    }
  

    private async _loadContentItems(): Promise<IPropertyPaneDropdownOption[]> {
      if (this._contentItemsLoaded) {
        return this._contentItemsOptions;
      }
  
      try {
        // Initialize service with current list
        this._spService.setListName(this.properties.listName);
  
        // Get items from the list
        const items = await this._spService.getResources();
  
        // Map items to dropdown options
        this._contentItemsOptions = items.map((item) => ({
          key: item.Id,
          text: item.Title || "No Title",
        }));
  
        // Add a "None" option
        this._contentItemsOptions.unshift({
          key: 0,
          text: "None (Use Property Pane Text)",
        });
  
        this._contentItemsLoaded = true;
        return this._contentItemsOptions;
      } catch (error) {
        console.error("Error loading content items:", error);
        return [{ key: 0, text: "None (Use Property Pane Text)" }];
      }
    }

    protected async loadPropertyPaneResources(): Promise<void> {
      await this._loadLists();
      if (this.properties.listName) {
        await this._loadContentItems();
      }
    }

    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
      return {
        pages: [
          {
            header: {
              description: strings.PropertyPaneDescription,
            },
            groups: [
              {
                groupName: strings.BasicGroupName,
                groupFields: [
                  PropertyPaneTextField("description", {
                    label: strings.DescriptionFieldLabel,
                    multiline: false,
                    placeholder: "Enter a description",
                  }),
                  PropertyPaneDropdown("listName", {
                    label: "Select List",
                    options: this._listsOptions,
                    selectedKey: this.properties.listName,
                  }),
                ],
              },
              {
                groupName: "Content Settings",
                groupFields: [
                  PropertyPaneToggle("useListContent", {
                    label: "Use Content from List Item",
                    checked: this.properties.useListContent,
                  }),
                  PropertyPaneDropdown("contentItemId", {
                    label: "Select Content Item",
                    options: this._contentItemsOptions,
                    selectedKey: this.properties.contentItemId,
                    disabled: !this.properties.useListContent,
                  }),
                  PropertyPaneTextField("headerText", {
                    label: "Header Text",
                    multiline: true,
                    rows: 3,
                    placeholder: "Enter header text",
                    disabled:
                      this.properties.useListContent &&
                      this.properties.contentItemId > 0,
                  }),
                  PropertyPaneTextField("bodyText", {
                    label: "Body Text",
                    multiline: true,
                    rows: 6,
                    placeholder: "Enter body text",
                    disabled:
                      this.properties.useListContent &&
                      this.properties.contentItemId > 0,
                  }),
                ],
              },
            ],
          },
        ],
      };
    }
  }
  