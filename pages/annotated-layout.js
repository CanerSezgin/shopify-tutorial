import {
  Button,
  Card,
  Form,
  FormLayout,
  Layout,
  Page,
  Stack,
  SettingToggle,
  TextField,
  TextStyle
} from "@shopify/polaris";

class AnnotatedLayout extends React.Component {
  state = {
    discount: "10%"
  };

  render() {
    const { discount, enabled } = this.state;
    const contentStatus = enabled ? "Disable" : "Enable";
    const textStatus = enabled ? "enabled" : "disabled";
    return (
      <Page>
        <Layout>
          <Layout.AnnotatedSection
            title="Default Discount"
            description="Add a product to Sample App, it will automatically be discounted."
          >
            <Card sectioned>
              <Form onSubmit={this.handleSubmit}>
                <FormLayout>
                  <TextField
                    value={discount}
                    onChange={this.handleChange("discount")}
                    label="Discount Percentage"
                    type="discount"
                  ></TextField>
                  <Stack distribution="trailing">
                    <Button primary submit>
                      Save
                    </Button>
                  </Stack>
                </FormLayout>
              </Form>
            </Card>
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection
            title="Price Updates"
            description="Temporarily disable all Sample App price updates"
          >
            <SettingToggle
              action={{
                content: contentStatus,
                onAction: this.handleToggle
              }}
              enabled={enabled}
            >
              This setting is{" "}
              <TextStyle variation="strong">{textStatus}</TextStyle>
            </SettingToggle>
          </Layout.AnnotatedSection>
        </Layout>
      </Page>
    );
  }

  handleSubmit = () => {
    this.setState({
      discount: this.state.discount
    });
    console.log("submission", this.state);
  };

  handleChange = field => value => this.setState({ [field]: value });
  handleToggle = () => {
    this.setState(({ enabled }) => ({ enabled: !enabled }));
  };
}

export default AnnotatedLayout;
