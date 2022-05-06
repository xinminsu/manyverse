// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Platform} from 'react-native';
import {Command, NavSource} from 'cycle-native-navigation';
import {navOptions as librariesNavOptions} from '~frontend/screens/libraries';
import {navOptions as backupScreenNavOptions} from '~frontend/screens/backup';
import {Screens} from '~frontend/screens/enums';
const dialogAboutNavOptions =
  Platform.OS === 'web'
    ? {}
    : require('~frontend/screens/dialog-about').navOptions;
const dialogThanksNavOptions =
  Platform.OS === 'web'
    ? {}
    : require('~frontend/screens/dialog-thanks').navOptions;

export interface Actions {
  goBack$: Stream<any>;
  goToBackup$: Stream<any>;
  goToLibraries$: Stream<any>;
  goToAbout$: Stream<any>;
  goToThanks$: Stream<any>;
}

export default function navigationCommands(
  actions: Actions,
  navSource: NavSource,
): Stream<Command> {
  const back$ = xs.merge(navSource.backPress(), actions.goBack$).mapTo({
    type: 'pop',
  } as Command);

  const toBackup$ = actions.goToBackup$.map(
    () =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.Backup,
            options: backupScreenNavOptions,
          },
        },
      } as Command),
  );

  /*   const toIpfs$ = actions.goToIpfs$.map(
    () =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.Ipfs,
            options: ipfsScreenNavOptions,
          },
        },
      } as Command),
  ); */

  const toLibraries$ = actions.goToLibraries$.map(
    () =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.Libraries,
            options: librariesNavOptions,
          },
        },
      } as Command),
  );

  const toAbout$ =
    Platform.OS === 'web'
      ? xs.never()
      : actions.goToAbout$.mapTo({
          type: 'showModal',
          layout: {
            component: {
              name: Screens.DialogAbout,
              options: dialogAboutNavOptions,
            },
          },
        } as Command);

  const toThanks$ =
    Platform.OS === 'web'
      ? xs.never()
      : actions.goToThanks$.mapTo({
          type: 'showModal',
          layout: {
            component: {
              name: Screens.DialogThanks,
              options: dialogThanksNavOptions,
            },
          },
        } as Command);

  return xs.merge(back$, toBackup$, toLibraries$, toAbout$, toThanks$);
}
