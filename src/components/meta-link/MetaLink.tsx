import * as React from 'react';
import { View, Text, Image, TouchableHighlight } from 'react-native';
import FastImage from 'react-native-fast-image';
import Element from 'components/element/Element';
import { Navigation } from 'react-native-navigation';
import { autobind } from 'core-decorators';
import UI from 'stores/UI';
import { theme } from 'styles';
import fetchMetadata from 'utils/fetchMetadata';
import { observer } from 'mobx-react';
const styles = theme(require('./MetaLink.styl'));

interface Props {
  title?: string;
  url: string;
  elementId?: string;
  image?: string;
  large?: boolean;
}

interface State {
  underlay: boolean;
  error: boolean;
  loading: boolean;
  title: string;
  image: string;
}

@observer
export default class MetaLink extends React.Component<Props, State> {

  private commitTimeout;
  private preview: boolean = false;
  private startTimestamp: number = 0;
  private dead: boolean = false;

  state = {
    title: this.props.title,
    image: this.props.image,
  } as State;
  elementId = this.props.elementId || `element_${this.props.url}`;

  componentWillMount() {
    this.fetch();
  }

  componentWillUnmount() {
    this.dead = true;
  }

  async fetch() {
    const { url } = this.props;
    if (!url || this.state.title || this.state.image) return;
    this.setState({ loading: true });
    const { title, image } = await fetchMetadata(url);
    if (this.dead) return;
    if (image) {
      const res = await FastImage.preload([{ uri: image }]);
    }
    if (this.dead) return;
    this.setState({
      title,
      image,
      loading: false,
    });
  }

  @autobind
  async onPress() {
    if (!this.preview) {
      UI.openURL(this.props.url);
    }
  }

  @autobind
  async onPressIn() {
    UI.openURL(this.props.url, this.elementId);
  }

  @autobind
  onTouchStart(e) {
    const { timestamp } = e.nativeEvent;
    this.startTimestamp = timestamp;
  }

  @autobind
  onTouchMove(e) {
    clearTimeout(this.commitTimeout);
    const { force, timestamp } = e.nativeEvent;
    const diff = timestamp - this.startTimestamp;
    if (force > 0.1 && diff > 350) {
      this.preview = true;
    }
    if (force > 0.75) {
      this.commitTimeout = setTimeout(() => { this.preview = false; }, 1000);
    }
  }

  @autobind
  onTouchEnd() {
    clearTimeout(this.commitTimeout);
    setTimeout(() => { this.preview = false; }, 1);
  }

  @autobind
  onShowUnderlay() {
    this.setState({
      underlay: true,
    });
  }

  @autobind
  onHideUnderlay() {
    this.setState({
      underlay: false,
    });
  }

  @autobind
  onImageError() {
    this.setState({
      error: true,
    });
  }

  renderIcon() {
    return (
      <View style={styles.icon}>
        <Image
          style={styles.icon__safari}
          source={require('assets/icons/32/safari.png')}
        />
      </View>
    );
  }

  render() {

    const { url, large } = this.props;
    const { image, title, underlay, error } = this.state;

    if (!url) {
      return null;
    }

    // Match URL
    const re = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)\/?(.*)/im;

    // Extract domain and path
    const [, domain = '', path = ''] = url.match(re);

    const contentStyles = [
      styles.content,
      image && styles.content__image,
      underlay && styles.content__underlay,
    ];

    const displayTitle = String(title || '').trim();
    const isTitle = displayTitle !== '';

    const titleElement = isTitle && (
      <Text
        style={styles.title}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {String(title).trim()}
      </Text>
    );

    const linkElement = (
      <Text
        style={styles.url}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        <Text style={styles.url__host}>{domain}</Text>
        {path && <Text style={styles.url__path}>
          /{path}
        </Text>}
      </Text>
    );

    return (
      <Element elementId={this.elementId}>
        <TouchableHighlight
          style={[styles.host, large && styles.host__large]}
          onPress={this.onPress}
          onPressIn={this.onPressIn}
          activeOpacity={1}
          underlayColor="transparent"
          onHideUnderlay={this.onHideUnderlay}
          onShowUnderlay={this.onShowUnderlay}
        >
          <View onTouchStart={this.onTouchStart} onTouchEnd={this.onTouchEnd} onTouchMove={this.onTouchMove}>
            {large && image && !error && (
              <FastImage
                source={{ uri: image }}
                style={styles.image}
                onError={this.onImageError}
                resizeMode="cover"
              />
            )}
            <View style={contentStyles}>
              {this.renderIcon()}
              <View style={styles.text}>
                {titleElement}
                {linkElement}
              </View>
              <Image
                style={styles.chevron}
                source={require('assets/icons/16/chevron-right.png')}
              />
            </View>
          </View>
        </TouchableHighlight>
      </Element>
    );
  }
}