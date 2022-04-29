// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PureComponent} from 'react';
import {Dimensions, ImageBackground, Platform, Text} from 'react-native';
import {h} from '@cycle/react';
import MessageContainer from './MessageContainer';
import MessageHeader, {Props as HeaderP} from './MessageHeader';
import MessageFooter, {Props as FooterP} from './MessageFooter';
import {AboutContent, Msg} from 'ssb-typescript';
import Markdown from '../Markdown';
import {View} from 'react-native';
import {t} from '~frontend/drivers/localization';
import {Dimensions as Dimens} from '~frontend/global-styles/dimens';
const toUrl = require('ssb-serve-blobs/id-to-url');

type Props = HeaderP &
  FooterP & {
    lastSessionTimestamp: number;
    gatheringInfo?: Msg<AboutContent>[];
  };

// Copied from ZoomableImage component
const ASPECT_RATIO = 768 / 1024;
const d = Dimensions.get('window');
const width = Platform.select<any>({
  web: `calc(${Dimens.desktopMiddleWidth.px} - ${
    2 * Dimens.horizontalSpaceBig
  }px)`,
  default: d.width - Dimens.horizontalSpaceBig * 2,
});
const height = Platform.select<any>({
  web: `calc(${ASPECT_RATIO} * (${Dimens.desktopMiddleWidth.px} - ${
    2 * Dimens.horizontalSpaceBig
  }px))`,
  default: ASPECT_RATIO * width,
});

export default class GatheringMessage extends PureComponent<Props> {
  public render() {
    const props = this.props;

    const unread = props.msg.timestamp > props.lastSessionTimestamp;

    if (!props.gatheringInfo) {
      // TODO
      return 'loading...';
    }

    console.log('GATHERING INFO', props.gatheringInfo);

    const content = props.gatheringInfo.reduce<
      AboutContent & {attendees: string[]}
    >(
      (computedContent, gatheringInfo) => {
        // @ts-expect-error
        const {attendee, content} = gatheringInfo.value;

        return {
          ...computedContent,
          ...content,
          // TODO: Show self as first if attending?
          // Type based on: https://github.com/ssbc/ssb-gathering-schema#attendee-type-about
          attendees: attendee
            ? attendee.remove
              ? computedContent.attendees.filter((a) => a === attendee.link)
              : [...computedContent.attendees, attendee.link]
            : computedContent.attendees,
        };
      },
      {type: 'about', about: props.msg.key, attendees: []},
    );

    console.log('GATHERING CONTENT', content);

    const image = content.image
      ? h(
          ImageBackground,
          {
            key: 'preview',
            source: {uri: toUrl(content.image.link)},
            accessible: true,
            accessibilityRole: 'image',
            accessibilityLabel: /* TODO use caption if available */ t(
              'message.image.without_caption.accessibility_label',
            ),
            style: [{width, height}], // TODO find the right size
          },
          [
            h(
              View,
              {
                style: {
                  position: 'absolute',
                  bottom: Dimens.verticalSpaceBig,
                  left: Dimens.horizontalSpaceBig,
                  display: 'flex',
                  flexDirection: 'row',
                },
              },
              [
                h(
                  View,
                  {
                    style: {
                      paddingHorizontal: Dimens.horizontalSpaceNormal,
                      paddingVertical: Dimens.verticalSpaceNormal,
                      backgroundColor: 'white',
                      borderRadius: Dimens.borderRadiusBig,
                    },
                  },
                  [h(Text, '1 Jan')],
                ),
                h(
                  View,
                  {
                    style: {
                      paddingHorizontal: Dimens.horizontalSpaceNormal,
                      paddingVertical: Dimens.verticalSpaceNormal,
                      marginLeft: Dimens.horizontalSpaceLarge,
                      backgroundColor: 'white',
                      borderRadius: Dimens.borderRadiusBig,
                    },
                  },
                  [h(Text, '12:00 CET - 15:00 CET')],
                ),
              ],
            ),
          ],
        )
      : null;

    return h(MessageContainer, {}, [
      h(MessageHeader, {...props, unread}),
      h(View, {style: [{position: 'relative'}]}, [image]),
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
