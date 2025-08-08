import { maskRiderId, formatRiderName, maskMultipleRiderIds } from './maskRiderId';

describe('maskRiderId', () => {
  test('정상적인 rider ID 마스킹', () => {
    expect(maskRiderId('BC9612345')).toBe('BC96*****');
    expect(maskRiderId('AB7889012')).toBe('AB78*****');
    expect(maskRiderId('XY1234567890')).toBe('XY12********');
  });

  test('4글자 미만인 경우', () => {
    expect(maskRiderId('ABC')).toBe('***');
    expect(maskRiderId('AB')).toBe('**');
    expect(maskRiderId('A')).toBe('*');
  });

  test('정확히 4글자인 경우', () => {
    expect(maskRiderId('ABCD')).toBe('ABCD');
  });

  test('빈 문자열이나 null인 경우', () => {
    expect(maskRiderId('')).toBe('****');
    expect(maskRiderId(null)).toBe('****');
    expect(maskRiderId(undefined)).toBe('****');
  });

  test('숫자가 아닌 타입인 경우', () => {
    expect(maskRiderId(123)).toBe('****');
    expect(maskRiderId({})).toBe('****');
    expect(maskRiderId([])).toBe('****');
  });
});

describe('formatRiderName', () => {
  test('정상적인 라이더명 포맷팅', () => {
    expect(formatRiderName('BC9612345')).toBe('BC96***** 라이더님');
    expect(formatRiderName('AB7889012')).toBe('AB78***** 라이더님');
  });

  test('짧은 ID의 라이더명 포맷팅', () => {
    expect(formatRiderName('ABC')).toBe('*** 라이더님');
  });
});

describe('maskMultipleRiderIds', () => {
  test('여러 rider ID 배열 마스킹', () => {
    const riderIds = ['BC9612345', 'AB7889012', 'XY1234567890'];
    const expected = ['BC96*****', 'AB78*****', 'XY12********'];
    expect(maskMultipleRiderIds(riderIds)).toEqual(expected);
  });

  test('빈 배열인 경우', () => {
    expect(maskMultipleRiderIds([])).toEqual([]);
  });

  test('배열이 아닌 경우', () => {
    expect(maskMultipleRiderIds('not an array')).toEqual([]);
    expect(maskMultipleRiderIds(null)).toEqual([]);
    expect(maskMultipleRiderIds(undefined)).toEqual([]);
  });
});

// 실제 사용 예시 테스트
describe('실제 사용 시나리오', () => {
  test('게시글 작성자 표시', () => {
    const post = {
      id: 1,
      rider_id: 'BC9612345',
      content: '휴게실에 정수기를 추가해주세요.',
      created_at: '2024-01-15'
    };

    const displayName = formatRiderName(post.rider_id);
    expect(displayName).toBe('BC96***** 라이더님');
  });

  test('댓글 작성자 목록', () => {
    const comments = [
      { rider_id: 'BC9612345', comment: '좋은 의견입니다.' },
      { rider_id: 'AB7889012', comment: '동의합니다.' },
      { rider_id: 'XY1234567890', comment: '저도 필요하다고 생각해요.' }
    ];

    const maskedComments = comments.map(comment => ({
      ...comment,
      displayName: formatRiderName(comment.rider_id)
    }));

    expect(maskedComments[0].displayName).toBe('BC96***** 라이더님');
    expect(maskedComments[1].displayName).toBe('AB78***** 라이더님');
    expect(maskedComments[2].displayName).toBe('XY12******** 라이더님');
  });
});