import * as React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActionSheetIOS, Share, AlertIOS } from 'react-native';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';
import FormatText from 'components/format-text/FormatText';
import MetaLink from 'components/meta-link/MetaLink';
import Item from 'stores/models/Item';
import { observer } from 'mobx-react';
import { autobind } from 'core-decorators';
import { replyScreen } from 'screens';
import { theme } from 'styles';
const styles = theme(require('./Header.styl'));

type IItemType = typeof Item.Type;

interface Props {
  key?: string;
  item: IItemType;
}

@observer
export default class StoryHeader extends React.Component<Props> {

  @autobind
  onVotePress() {
    this.props.item.vote();
  }

  @autobind
  onFlagPress() {
    if (this.props.item.isUserFlag) {
      return this.props.item.flag();
    }

    AlertIOS.alert(
      'Confirm report',
      'Do you want to report this story?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => this.props.item.flag(),
        },
      ],
    );
  }

  @autobind
  onHidePress() {
    this.props.item.hide();
  }

  @autobind
  onReplyPress() {
    return replyScreen(this.props.item.id);
  }

  @autobind
  onSharePress() {
    if (!this.props.item.url) {
      return this.share(`https://news.ycombinator.com/item?id=${this.props.item.id}`);
    }

    ActionSheetIOS.showActionSheetWithOptions(
      {
        cancelButtonIndex: 2,
        options: [{
          icon: resolveAssetSource(require('assets/icons/32/safari-line.png')),
          title: 'Hackernews Link',
          titleTextAlignment: 0,
        }, {
          icon: resolveAssetSource(require('assets/icons/32/safari-line.png')),
          title: 'Content Link',
          titleTextAlignment: 0,
        }, {
          title: 'Cancel',
        }] as any,
      },
      (index) => {
        if (index === 0) {
          this.share(`https://news.ycombinator.com/item?id=${this.props.item.id}`);
        }
        if (index === 1) {
          this.share(this.props.item.url);
        }
        console.log('done', index);
      },
    );
  }

  share(url: string) {
    Share.share({
      title: this.props.item.title,
      url: this.props.item.url,
    });
  }

  render() {
    const { item } = this.props;

    if (!item) {
      return null;
    }

    const { title, score, descendants, ago, text, prettyText, by, metadata = {}, url } = item;

    return (
      <View style={[styles.host, { borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: -StyleSheet.hairlineWidth }]}>
        <View>
          {!!title && <Text style={styles.title}>{title}</Text>}
          <MetaLink
            {...metadata}
            url={url}
            large={true}
          />
          {!!text && (
            <FormatText>
              {prettyText}
            </FormatText>
          )}
          <Text style={styles.author}>by <Text style={styles.author__bold}>{by}</Text></Text>

          <View style={styles.row}>
            <Image style={styles.row__icon} source={require('assets/icons/16/arrow-up.png')} />
            <Text style={styles.row__text}>{score}</Text>
            <Image style={styles.row__icon} source={require('assets/icons/16/comments.png')} />
            <Text style={styles.row__text}>{descendants}</Text>
            <Image style={styles.row__icon} source={require('assets/icons/16/clock.png')} />
            <Text style={styles.row__text}>{ago}</Text>
          </View>
        </View>
        <View style={[styles.actions, { borderTopWidth: StyleSheet.hairlineWidth }]}>
          <TouchableOpacity style={styles.actions__item} onPress={this.onVotePress}>
            <Image
              source={require('assets/icons/100/vote.png')}
              style={[styles.icon, item.isUserVote && styles.icon__active]}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actions__item} onPress={this.onFlagPress}>
            <Image
              source={require('assets/icons/100/flag.png')}
              style={[styles.icon, item.isUserFlag && styles.icon__active, { width: 23, height: 23 }]}
            />
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.actions__item} onPress={this.onHidePress}>
            <Image
              source={require('assets/icons/100/hide.png')}
              style={[styles.icon, item.isUserHidden && styles.icon__active]}
            />
          </TouchableOpacity> */}
          <TouchableOpacity style={styles.actions__item} onPress={this.onReplyPress}>
            <Image
              source={require('assets/icons/100/reply.png')}
              style={[styles.icon, { width: 34, height: 34 }]}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actions__item} onPress={this.onSharePress}>
            <Image
              source={require('assets/icons/100/share.png')}
              style={[styles.icon, { width: 26, height: 26 }]}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}