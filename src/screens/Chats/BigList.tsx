import React, { FC } from 'react';
import { FlatList, FlatListProps, ListRenderItem, ViewStyle } from 'react-native';

import { Avatar, Divider, List } from 'react-native-paper';
import Animated from 'react-native-reanimated';

import { useCollapsibleHeader } from '!/contexts/collapsible-header';

type Item = { id: string; name: string };

const FlatListAnimated = Animated.createAnimatedComponent(FlatList) as FC<
  Animated.AnimateProps<ViewStyle, FlatListProps<Item>>
>;

const BigList: FC<unknown> = () => {
  const { onScroll } = useCollapsibleHeader();

  return (
    <FlatListAnimated
      data={data}
      ItemSeparatorComponent={Divider}
      keyExtractor={keyExtractor}
      onScroll={onScroll}
      renderItem={renderItem}
      scrollEventThrottle={16}
    />
  );
};

const keyExtractor = (item: Item) => item.id;

const renderItem: ListRenderItem<Item> = ({ item, index }) => (
  <List.Item
    description={item.id}
    left={(props) => (
      <Avatar.Image
        {...props}
        source={{
          uri: `https://randomuser.me/api/portraits/${(index + 1) % 2 === 0 ? 'men' : 'women'}/${
            index + 1
          }.jpg`,
        }}
      />
    )}
    title={item.name}
  />
);

const data: Item[] = [
  { id: '275e1ba4-01dc-4b1a-ac01-d15e4008c0e5', name: 'Larissa Carvalho' },
  { id: '2004abfc-7492-4530-a320-a7dfa6ef2ef9', name: 'Alessandra Reis' },
  { id: '385a96ec-1529-4d07-9100-5216eb1065b1', name: 'Sr. Felícia Reis' },
  { id: '50af2ebc-4f16-47d3-95f3-ade424e323bd', name: 'Alexandre Saraiva' },
  { id: '979fc128-ad74-4212-991c-1efcdfcfb902', name: 'Júlio César Carvalho' },
  { id: 'dcd4c93d-58ea-414a-b5b6-6ce84462a700', name: 'Morgana Silva' },
  { id: '2a36a926-1d8f-4bce-8310-10d6f3bbe215', name: 'Víctor Souza Filho' },
  { id: 'f93a214a-e201-448f-ae25-1b7306abedc4', name: 'Ladislau Carvalho Neto' },
  { id: '9353bb16-b300-47d6-8122-34d32bc34cf4', name: 'Sara Santos' },
  { id: '9a6c57ad-725d-4754-bbc5-540bd32fe3af', name: 'Ladislau Souza' },
  { id: '5a4604ed-a4f6-41ab-b3c5-fa7787679d1d', name: 'Dr. Eduardo Franco' },
  { id: '25fa68e1-63eb-427e-8745-f17d03a8e3c1', name: 'Marcela Macedo' },
  { id: 'f79e5016-9f10-499f-a478-adecb9793886', name: 'Paula Moraes' },
  { id: '66f9a5c2-97f2-49c2-b5b1-461e7fa0b046', name: 'Margarida Macedo' },
  { id: '7c984997-cdc4-49c6-9938-bc4402a16e01', name: 'Suélen Oliveira' },
  { id: '605798f0-be05-4f6f-bef3-806ce46f2f4a', name: 'Hélio Costa Filho' },
  { id: 'dc58e750-6c4d-492b-ac04-4cc500556138', name: 'Suélen Melo' },
  { id: '206ea565-df57-4273-bbcf-c3a3ae8a6c34', name: 'Isabela Albuquerque' },
  { id: '08312c24-a702-49b9-b684-5db613b4201f', name: 'Alessandra Nogueira' },
  { id: '2ee65615-493a-41cb-974d-01f4de12a054', name: 'Márcia Santos' },
  { id: '711da1fe-890b-484e-907d-23eb78c2f39f', name: 'Alexandre Moraes' },
  { id: 'ae77d5bc-c3c3-478e-a3fd-aed2a486d7eb', name: 'Janaína Carvalho Neto' },
  { id: 'e73efcab-3eae-4f92-bc03-36e328c64ac3', name: 'Hélio Reis' },
  { id: 'b03cfad2-7fde-46ae-8e43-3aae701efd85', name: 'Vicente Souza' },
  { id: 'efed4026-2de8-4dc7-8d44-bce44cc44cc5', name: 'Vitória Carvalho' },
  { id: '067d6343-4c5b-4424-83f6-4047a1e1edc7', name: 'Frederico Martins' },
  { id: 'd33b4ac0-fd5e-4d5a-894c-fbe21b76057d', name: 'Paulo Batista' },
  { id: 'c147e500-39c7-4198-9d69-e1558f551972', name: 'Júlio César Xavier' },
  { id: '2ce3e205-f57e-479a-a033-5d57d14a430f', name: 'Marcelo Nogueira' },
  { id: '8643d405-c471-479e-b122-f997102d17fc', name: 'Eduardo Melo' },
  { id: '2451645f-fdef-4233-a562-673a2a8c11d3', name: 'Fabiano Martins Jr.' },
  { id: 'aa0fc072-bec1-4327-be7f-e98962d72760', name: 'Lucas Reis' },
  { id: '92586232-de19-40e7-8e40-61dc57bbf7e1', name: 'Sr. Bruna Souza' },
  { id: 'fa7fc2bf-a7a7-48b1-9609-7d2b2265fef8', name: 'Roberto Souza' },
  { id: '39896ef7-426d-45e3-b803-256c92f6eb77', name: 'Tertuliano Costa' },
  { id: '1bfc46a7-2c31-4f6f-a4ee-32345d9d1ba2', name: 'Alexandre Melo' },
  { id: '24b3151b-4d01-4cf0-8cd7-d996cc243a2f', name: 'Elísio Albuquerque' },
];

export default BigList;
