'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, './index.html'), 'utf8');
const code = html.split('<script id="logic-source">')[1].split('</script>')[0];
const { calculate, compare } = new Function('module', code + ';return module.exports;')({});

test('쿠폰·배송·회원비를 합쳐 실제 저렴한 곳 계산', () => {
  const a = calculate({ price: 99900, kind: 'percent', coupon: 15, cap: 10000, shipping: 3000 });
  const b = calculate({ price: 95000, kind: 'flat', coupon: 10000, membership: 4990 });
  assert.equal(a.total, 92900);
  assert.equal(b.total, 89990);
  assert.deepEqual(compare(a,b), { difference: 2910, winner: 1 });
});
test('정률의 원 미만은 버리고 최대 할인액 0원은 그대로 적용', () => {
  assert.equal(calculate({ price:12345, kind:'percent', coupon:12.34 }).discount, 1523);
  assert.equal(calculate({ price:9999, kind:'percent', coupon:12.5, cap:0 }).discount, 0);
});
test('상품가보다 큰 쿠폰도 배송비는 공제하지 않음', () => {
  assert.equal(calculate({ price:2000, kind:'flat', coupon:5000, shipping:3000 }).total, 3000);
});
test('동률·0원·유효 범위 밖 입력 처리', () => {
  assert.deepEqual(compare(calculate({price:0}), calculate({price:0})), { difference:0, winner:null });
  assert.equal(calculate({price:-1}), null);
  assert.equal(calculate({price:1,kind:'percent',coupon:100.1}), null);
  assert.equal(calculate({price:1,shipping:NaN}), null);
  assert.equal(compare(null, calculate({price:1})), null);
});
