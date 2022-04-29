// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PureComponent} from 'react';
import {Image} from 'react-native';
import {h} from '@cycle/react';
import MessageContainer from './MessageContainer';
import MessageHeader, {Props as HeaderP} from './MessageHeader';
import MessageFooter, {Props as FooterP} from './MessageFooter';
import {AboutContent, Msg} from 'ssb-typescript';
import Markdown from '../Markdown';
import {View} from 'react-native';
import {t} from '~frontend/drivers/localization';
const toUrl = require('ssb-serve-blobs/id-to-url');

type Props = HeaderP &
  FooterP & {
    lastSessionTimestamp: number;
    gatheringInfo?: Msg<AboutContent>[];
  };

export default class GatheringMessage extends PureComponent<Props> {
  public render() {
    const props = this.props;

    const unread = props.msg.timestamp > props.lastSessionTimestamp;

    if (!props.gatheringInfo) {
      // TODO
      return 'loading...';
    }
    const content = props.gatheringInfo.reduce<AboutContent>(
      (computedContent, gatheringInfo) => {
        return {
          ...computedContent,
          ...gatheringInfo.value.content,
        };
      },
      {type: 'about', about: props.msg.key},
    );

    const image = content.image
      ? h(Image, {
          key: 'preview',
          source: {uri: toUrl(content.image.link)},
          accessible: true,
          accessibilityRole: 'image',
          accessibilityLabel:
            this.props.title ??
            t('message.image.without_caption.accessibility_label'),
          style: [{width: 10, height: 10}],
        })
      : null;

    return h(MessageContainer, {}, [
      h(MessageHeader, {...props, unread}),
      image,
      h(View, {key: 'p'}, [
        h(Markdown, {
          key: 'md',
          text: content.description ?? '',
        }),
      ]),
      h(MessageFooter, props),
    ]);
  }
}
