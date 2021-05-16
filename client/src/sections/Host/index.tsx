import React, { useState, FormEvent } from 'react';
import { useMutation } from '@apollo/react-hooks';
import {
  Icon,
  Layout,
  Typography,
  Form,
  Input,
  Radio,
  InputNumber,
  Upload,
  Button,
} from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { Viewer } from '../../lib/types';
import { Link, Redirect } from 'react-router-dom';
import { HOST_LISTING } from '../../lib/graphql/mutations';
import {
  HostListing as HostListingData,
  HostListingVariables,
} from '../../lib/graphql/mutations/HostListing/__generated__/HostListing';
import { ListingType } from '../../lib/graphql/globalTypes';
import {
  iconColor,
  displayErrorMessage,
  displaySuccessNotification,
} from '../../lib/utils';
import { UploadChangeParam } from 'antd/lib/upload';

const { Content } = Layout;
const { Text, Title } = Typography;
const { Item } = Form;

interface Props {
  viewer: Viewer;
}

export const Host = ({ viewer, form }: Props & FormComponentProps) => {
  const [imageLoading, setImageLoading] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const [hostListing, { loading, data }] = useMutation<
    HostListingData,
    HostListingVariables
  >(HOST_LISTING, {
    onCompleted: () => {
      displaySuccessNotification("You've successfully created your listing!");
    },
    onError: () => {
      displayErrorMessage(
        "Sorry! We weren't able to create your listing. Please try again later!",
      );
    },
  });

  const handleImageUpload = (info: UploadChangeParam) => {
    const { file } = info;
    if (file.status === 'uploading') {
      return setImageLoading(true);
    }

    if (file.status === 'done' && file.originFileObj) {
      getBase64Value(file.originFileObj, (b64) => {
        setImageBase64(b64);
        setImageLoading(false);
      });
    }
  };

  const handleHostListing = (event: FormEvent) => {
    event.preventDefault();

    form.validateFields((err, values) => {
      if (err) {
        displayErrorMessage('Please fill in all the required form fields!');
      }

      const fullAddress = `${values.address}, ${values.city}, ${values.state}, ${values.zip}`;

      const input = {
        ...values,
        address: fullAddress,
        image: imageBase64,
        price: values.price * 100,
      };

      delete input.city;
      delete input.state;
      delete input.zip;

      console.log(input);

      hostListing({ variables: { input } });
    });
  };

  if (!viewer.id || !viewer.hasWallet) {
    return (
      <Content className="host-content">
        <div className="host__form-header">
          <Title level={3} className="host__form-title">
            You'll have to be signed in and connected with Stripe to host a
            listing!
          </Title>
          <Text type="secondary">
            We only allow users who've signed in to our application and have
            connected with Stripe to host new listings. You can sign in at the{' '}
            <Link to="/login">/login</Link> page and connect with Stripe shortly
            after.
          </Text>
        </div>
      </Content>
    );
  }

  if (loading) {
    return (
      <Content className="host-content">
        <div className="host__form-header">
          <Title level={3} className="host__form-title">
            Please wait!
          </Title>
          <Text type="secondary">We're creating your listing now.</Text>
        </div>
      </Content>
    );
  }

  if (data?.hostListing) {
    return <Redirect to={`/listing/${data.hostListing.id}`} />;
  }

  const { getFieldDecorator } = form;

  return (
    <Content className="host-content">
      <Form layout="vertical" onSubmit={handleHostListing}>
        <div className="host__form-header">
          <Title level={3} className="host__form-title">
            Hi! Let's get started listing your place.
          </Title>
          <Text type="secondary">
            In this form, we'll collect some basic information about your
            listing.
          </Text>
        </div>

        <Item label="Home Type">
          {getFieldDecorator('type', {
            rules: [{ required: true, message: 'Please select a home type!' }],
          })(
            <Radio.Group>
              <Radio.Button value={ListingType.APARTMENT}>
                <Icon type="bank" style={{ color: iconColor }} />
                <span> Apartment</span>
              </Radio.Button>
              <Radio.Button value={ListingType.HOUSE}>
                <Icon type="home" style={{ color: iconColor }} />
                <span> House</span>
              </Radio.Button>
            </Radio.Group>,
          )}
        </Item>

        <Item label="Max number of guests">
          {getFieldDecorator('numOfGuests', {
            rules: [
              {
                required: true,
                message: 'Please enter the max number of guests!',
              },
            ],
          })(<InputNumber min={1} placeholder="4" />)}
        </Item>

        <Item label="Title" extra="Max character count of 45">
          {getFieldDecorator('title', {
            rules: [
              {
                required: true,
                message: 'Please enter a title for your listing!',
              },
            ],
          })(
            <Input
              maxLength={45}
              placeholder="The iconic and luxurious Bel-Air mansion"
            />,
          )}
        </Item>

        <Item label="Description" extra="Max character count of 400">
          {getFieldDecorator('description', {
            rules: [
              {
                required: true,
                message: 'Please enter a description for your listing!',
              },
            ],
          })(
            <Input.TextArea
              rows={3}
              maxLength={400}
              placeholder="Modern, clean and iconic home of the Fresh Prince. Situated in the heart of Bel-Air, Los Angeles"
            />,
          )}
        </Item>

        <Item label="Address">
          {getFieldDecorator('address', {
            rules: [
              {
                required: true,
                message: 'Please enter an address for your listing!',
              },
            ],
          })(<Input placeholder="251 North Bristol Avenue" />)}
        </Item>

        <Item label="City/Town">
          {getFieldDecorator('city', {
            rules: [
              {
                required: true,
                message: 'Please enter a city (or town) for your listing!',
              },
            ],
          })(<Input placeholder="Los Angeles" />)}
        </Item>

        <Item label="State/Province">
          {getFieldDecorator('state', {
            rules: [
              {
                required: true,
                message: 'Please enter a state (or province) for your listing!',
              },
            ],
          })(<Input placeholder="Los Angeles" />)}
        </Item>

        <Item label="Zip/Postal Code">
          {getFieldDecorator('zip', {
            rules: [
              {
                required: true,
                message: 'Please enter a zip (or postal) for your listing!',
              },
            ],
          })(<Input placeholder="Please enter a zip code for your listing!" />)}
        </Item>

        <Item
          label="Image"
          extra="Images have to be under 1MB in size and of type JPG or PNG"
        >
          <div className="host__form-image-upload">
            {getFieldDecorator('image', {
              rules: [
                {
                  required: true,
                  message: 'Please enter an image for your listing!',
                },
              ],
              getValueFromEvent: (evt: any) => {
                if (Array.isArray(evt)) {
                  return evt;
                }
                return evt?.fileList;
              },
              valuePropName: 'fileList',
            })(
              <Upload
                name="image"
                listType="picture-card"
                customRequest={dummyRequest}
                showUploadList={false}
                beforeUpload={beforeImageUpload}
                onChange={handleImageUpload}
              >
                {imageBase64 ? (
                  <img src={imageBase64} alt="Listing" />
                ) : (
                  <div>
                    <Icon type={imageLoading ? 'loading' : 'plus'} />
                    <div className="ant-upload-text">Upload</div>
                  </div>
                )}
              </Upload>,
            )}
          </div>
        </Item>

        <Item label="Price" extra="Price in $USD/day">
          {getFieldDecorator('price', {
            rules: [
              {
                required: true,
                message: 'Please enter a price for your listing!',
              },
            ],
          })(<InputNumber min={0} placeholder="120" />)}
        </Item>

        <Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Item>
      </Form>
    </Content>
  );
};

const beforeImageUpload = (file: File) => {
  if (!file) {
    displayErrorMessage("Sorry, your image wasn't uploaded. Please try again.");
    return false;
  }

  const fileIsValidImage =
    file.type === 'image/jpeg' || file.type === 'image/png';
  const fileIsValidSize = file.size / 1024 / 1024 < 1;

  if (!fileIsValidImage) {
    displayErrorMessage(
      "You're only allowed to upload valid JPG or PNG files!",
    );
  }

  if (!fileIsValidSize) {
    displayErrorMessage(
      "You're only allowed to upload files with size less than 1MB!",
    );
  }

  return fileIsValidImage && fileIsValidSize;
};

const getBase64Value = (img: File | Blob, cb: (b64Value: string) => void) => {
  const reader = new FileReader();
  reader.readAsDataURL(img);
  reader.onload = () => {
    cb(reader.result as string);
  };
};

const dummyRequest = ({ onSuccess }: { onSuccess: any }) => {
  setTimeout(() => {
    onSuccess('ok');
  }, 0);
};

export const WrappedHost = Form.create<Props & FormComponentProps>({
  name: 'host_form',
})(Host);
