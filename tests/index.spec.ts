import { indexListByFields, memoizeIndexedArray } from '../src';

const items = [
  {
    title: 'War of the Worlds',
    authorId: 1,
    publisherId: 1,
    subjectId: 1,
  },
  {
    title: 'Of Mice and Men',
    authorId: 2,
    publisherId: 1,
    subjectId: 2,
  },
  {
    title: 'The Time Machine',
    authorId: 1,
    publisherId: 2,
    subjectId: 1,
  },
  {
    title: 'Little Women',
    authorId: 3,
    publisherId: 3,
    subjectId: 2,
  },
  {
    title: 'The Scarlet Letter',
    authorId: 4,
    publisherId: 2,
    subjectId: 3,
  },
  {
    title: 'The Great Gatsby',
    authorId: 5,
    publisherId: 3,
    subjectId: 3,
  },
  {
    title: 'Adventures of Huckleberry Finn',
    authorId: 6,
    publisherId: 2,
    subjectId: 2,
  },
  {
    title: 'Adventures of Tom Sawyer',
    authorId: 6,
    publisherId: 3,
    subjectId: 2,
  },
  {
    title: 'Lord of the Flies',
    authorId: 7,
    publisherId: 4,
    subjectId: 3,
  },
  {
    title: 'The Invisible Man',
    authorId: 1,
    publisherId: 2,
    subjectId: 1,
  },
];

const newItem = {
  title: 'Free Fall',
  authorId: 7,
  publisherId: 2,
  subjectId: 3,
};

const WAROFTHEWORLDS = items[0];
const OFMICEANDMEN = items[1];
const THETIMEMACHINE = items[2];
const LITTLEWOMEN = items[3];
const THESCARLETLETTER = items[4];
const THEGREATGATSBY = items[5];
const HUCKLEBERRYFINN = items[6];
const TOMSAWYER = items[7];
const LORDOFTHEFLIES = items[8];
const THEINVISIBLEMAN = items[9];

describe('indexListByFields', () => {
  const indexer = indexListByFields('authorId', 'publisherId', 'subjectId', [
    'publisherId',
    'subjectId',
  ]);
  test('it produces the expected result', () => {
    const itemsIndexedBy = indexer(items);

    expect(itemsIndexedBy).toEqual({
      authorId: {
        1: [WAROFTHEWORLDS, THETIMEMACHINE, THEINVISIBLEMAN],
        2: [OFMICEANDMEN],
        3: [LITTLEWOMEN],
        4: [THESCARLETLETTER],
        5: [THEGREATGATSBY],
        6: [HUCKLEBERRYFINN, TOMSAWYER],
        7: [LORDOFTHEFLIES],
      },
      publisherId: {
        1: [WAROFTHEWORLDS, OFMICEANDMEN],
        2: [THETIMEMACHINE, THESCARLETLETTER, HUCKLEBERRYFINN, THEINVISIBLEMAN],
        3: [LITTLEWOMEN, THEGREATGATSBY, TOMSAWYER],
        4: [LORDOFTHEFLIES],
      },
      subjectId: {
        1: [WAROFTHEWORLDS, THETIMEMACHINE, THEINVISIBLEMAN],
        2: [OFMICEANDMEN, LITTLEWOMEN, HUCKLEBERRYFINN, TOMSAWYER],
        3: [THESCARLETLETTER, THEGREATGATSBY, LORDOFTHEFLIES],
      },
      publisherIdsubjectId: {
        1: {
          1: [WAROFTHEWORLDS],
          2: [OFMICEANDMEN],
        },
        2: {
          1: [THETIMEMACHINE, THEINVISIBLEMAN],
          2: [HUCKLEBERRYFINN],
          3: [THESCARLETLETTER],
        },
        3: {
          2: [LITTLEWOMEN, TOMSAWYER],
          3: [THEGREATGATSBY],
        },
        4: {
          3: [LORDOFTHEFLIES],
        },
      },
    });
  });

  test('compares objects using a processor', () => {
    type MetaObject = {
      meta: number,
      data: any
    };

    const obj1: MetaObject = {
      meta: 1,
      data: WAROFTHEWORLDS
    };
    const obj2: MetaObject = {
      meta: 2,
      data: LITTLEWOMEN
    };
    const obj3: MetaObject = {
      meta: 3,
      data: LORDOFTHEFLIES
    };

    const items: MetaObject[] = [obj1, obj2, obj3];
    const indexer = indexListByFields('authorId', 'publisherId', 'subjectId');

    const itemsIndexedBy = indexer(items, item => item.data);

    expect(itemsIndexedBy).toEqual({
      authorId: {
        1: [obj1],
        3: [obj2],
        7: [obj3],
      },
      publisherId: {
        1: [obj1],
        3: [obj2],
        4: [obj3],
      },
      subjectId: {
        1: [obj1],
        2: [obj2],
        3: [obj3],
      }
    })
  });
});

describe('memoizeIndexedArray', () => {
  const indexer = memoizeIndexedArray(indexListByFields('authorId', 'publisherId', 'subjectId'));

  test('it produces the expected result', () => {
    const itemsIndexedBy = indexer(items);
    const itemsIndexedByNext = indexer([...items, newItem]);

    expect(itemsIndexedBy.authorId[1]).toBe(itemsIndexedByNext.authorId[1]);
    expect(itemsIndexedBy.authorId[4]).toBe(itemsIndexedByNext.authorId[4]);
    expect(itemsIndexedBy.authorId[7]).not.toBe(itemsIndexedByNext.authorId[7]);

    expect(itemsIndexedBy.publisherId[1]).toBe(itemsIndexedByNext.publisherId[1]);
    expect(itemsIndexedBy.publisherId[2]).not.toBe(itemsIndexedByNext.publisherId[2]);

    expect(itemsIndexedBy.subjectId[1]).toBe(itemsIndexedByNext.subjectId[1]);
    expect(itemsIndexedBy.subjectId[3]).not.toBe(itemsIndexedByNext.subjectId[3]);
  });

  test('clears out for empty array', () => {
    const itemsIndexedBy = indexer(items);
    const itemsIndexedByNext = indexer([]);

    expect(itemsIndexedByNext).toEqual({
      "authorId": {},
      "publisherId": {},
      "subjectId": {},
    });
  });

  test('it returns the same state when no changes', () => {
    const itemsIndexedBy = indexer(items);
    const itemsIndexedByNext = indexer(items);

    expect(itemsIndexedBy.authorId[1]).toBe(itemsIndexedByNext.authorId[1]);
    expect(itemsIndexedBy.publisherId[1]).toBe(itemsIndexedByNext.publisherId[1]);
    expect(itemsIndexedBy).toBe(itemsIndexedByNext);
  });


});