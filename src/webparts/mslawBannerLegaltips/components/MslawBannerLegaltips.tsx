import * as React from "react";
import styles from "./MslawBannerLegaltips.module.scss";
import type { IMslawBannerLegaltipsProps } from "./IMslawBannerLegaltipsProps";
import { IResourceItem } from "../models/IResourceItem";
import { SPService } from "../services/SPListService";

interface IMslawBannerLegaltipsState {
  resources: IResourceItem[];
  isLoading: boolean;
  error: string | undefined;
  contentItem: IResourceItem | undefined;
}

export default class MslawBannerLegaltips extends React.Component<
  IMslawBannerLegaltipsProps,
  IMslawBannerLegaltipsState
> {

  private _spService: SPService; // create instance of service

  // INITIALIZATION OF STATE AND SERVICE
  // Costuctor to initialize Initialize the SP service and state
  constructor(props: IMslawBannerLegaltipsProps) {
    super(props);

    // Initialize the state
    this.state = {
      resources: [],
      isLoading: false,
      error: undefined,
      contentItem: undefined,
    };

    // Initialize the SP service
    this._spService = new SPService(this.props.context);
    if (this.props.listName) {
      this._spService.setListName(this.props.listName);
    }
  }


  // COMPONENT LIFECYCLE METHODS
  // Load resources when the component mounts
  // If the properties are there then load the Content Item
  public componentDidMount(): void {
    this._loadResources().catch((error) => {
      console.error("Failed to load the resource", error);
    });
    if (this.props.useListContent && this.props.contentItemId) {
      this._loadContentItem(this.props.contentItemId).catch((error) => {
        console.error("Failed to load the content item", error);
      });
    }
  }


  // RELOAD RESOURCES AND CONTENT ITEM
  // Reload resources and content item when the component updates
  public componentDidUpdate(prevProps: IMslawBannerLegaltipsProps): void {
    // Reload resources if list name changes
    if (prevProps.listName !== this.props.listName && this.props.listName) {
      this._spService.setListName(this.props.listName);
      this._loadResources().catch((error) => {
        console.error("Failed to load the resource", error);
      });
    }

    // Reload content item if ID changes
    if (
      (prevProps.contentItemId !== this.props.contentItemId &&
        this.props.contentItemId) ||
      (prevProps.useListContent !== this.props.useListContent &&
        this.props.useListContent)
    ) {
      if (this.props.useListContent && this.props.contentItemId) {
        this._loadContentItem(this.props.contentItemId).catch((error) => {
          console.error("Failed to load the content item", error);
        });
      } else {
        this.setState({ contentItem: undefined });
      }
    }
  }


  // LOAD RESOURCES AND CONTENT ITEM
  // Load resources from the list
  private async _loadResources(): Promise<void> {
    try {
      this.setState({ isLoading: true, error: undefined });

      const resources = await this._spService.getResources();

      this.setState({
        resources,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error loading resources:", error);
      this.setState({
        isLoading: false,
        error:
          "Failed to load resources. Please check the list name and try again.",
      });
    }
  }

  // LOAS CONTENT ITEM
  // Load a specific content item by ID
  private async _loadContentItem(id: number): Promise<void> {
    try {
      this.setState({ isLoading: true, error: undefined });

      const contentItem = await this._spService.getContentById(id);

      this.setState({
        contentItem,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error loading content item:", error);
      this.setState({
        isLoading: false,
        error: "Failed to load content item.",
      });
    }
  }

  // MARKUP FOR RENDERING HTML CONTENT SAFELY
  // Helper function to create markup for rendering HTML content safely
  private _createMarkup(htmlContent: string): { __html: string } {
    return { __html: htmlContent };
  }



  public render(): React.ReactElement<IMslawBannerLegaltipsProps> {
    const { headerText, bodyText, useListContent,titleText } = this.props;
    const { contentItem, isLoading, error } = this.state;

    // Determine which content to display

    const textContent =
      useListContent && contentItem
        ? contentItem.Text || titleText
        : titleText;

    const headerContent =
      useListContent && contentItem
        ? contentItem.HeaderContent || headerText
        : headerText;

    const bodyContent =
      useListContent && contentItem
        ? contentItem.BodyContent || bodyText
        : bodyText;

        return (
          <section className={styles.heroBanner}>
            <div className={styles.topRule} />
            <div className={styles.rightRule} />
            <div className={styles.bottomRule} />
            <div className={styles.leftRule} /> 
    
            {/* Added container div for horizontal layout */}
            <div className={styles.columnsContainer}>
              <div className={styles.columnLeft}>
                <div className={styles.headerContainer}>
                {isLoading ? (
                    <div>Loading content...</div>
                  ) : error ? (
                    <div>{error}</div>
                  ) : (
                    <h1
                      className={styles.heroTitle}
                      dangerouslySetInnerHTML={this._createMarkup(textContent)}
                    />
                  )}

                </div> 
                <div className={styles.headerContainer}>
                  {isLoading ? (
                    <div>Loading content...</div>
                  ) : error ? (
                    <div>{error}</div>
                  ) : (
                    <h1
                      className={styles.heroText}
                      dangerouslySetInnerHTML={this._createMarkup(headerContent)}
                    />
                  )}
                </div>
              </div>
    
              <div className={styles.columnRight}>
                <div className={styles.bodyContainer}>
                  {isLoading ? (
                    <div>Loading content...</div>
                  ) : error ? (
                    <div>{error}</div>
                  ) : (
                    <div
                      className={styles.bodyText}
                      dangerouslySetInnerHTML={this._createMarkup(bodyContent)}
                    />
                  )}
                  {/* <div className={styles.resourcesContainer}>
                    {this._renderResources()}
                  </div> */}
                </div>
              </div>
            </div>
          </section>
        );
  }
}
