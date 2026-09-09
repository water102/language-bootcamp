import test from 'node:test';
import assert from 'node:assert/strict';
import { eventBus, DOMAIN_EVENTS } from '../../src/core/events/eventBus.js';

test('EventBus - Subscribe, Publish, Unsubscribe', () => {
  eventBus.reset();

  let received = null;
  const unsubscribe = eventBus.subscribe(DOMAIN_EVENTS.SESSION_COMPLETED, (payload) => {
    received = payload;
  });

  eventBus.publish(DOMAIN_EVENTS.SESSION_COMPLETED, { slotId: 'slot_123', actualMinutes: 45 });
  assert.deepEqual(received, { slotId: 'slot_123', actualMinutes: 45 });

  // After unsubscribe
  received = null;
  unsubscribe();
  eventBus.publish(DOMAIN_EVENTS.SESSION_COMPLETED, { slotId: 'slot_456', actualMinutes: 60 });
  assert.equal(received, null);
});

test('EventBus - Wildcard subscriber catches all domain events', () => {
  eventBus.reset();

  const caughtEvents = [];
  eventBus.subscribe('*', (eventName, payload) => {
    caughtEvents.push({ eventName, payload });
  });

  eventBus.publish(DOMAIN_EVENTS.PLAN_CREATED, { planId: 'p1' });
  eventBus.publish(DOMAIN_EVENTS.STREAK_UPDATED, { streak: 5 });

  assert.equal(caughtEvents.length, 2);
  assert.equal(caughtEvents[0].eventName, DOMAIN_EVENTS.PLAN_CREATED);
  assert.equal(caughtEvents[1].eventName, DOMAIN_EVENTS.STREAK_UPDATED);
});

test('EventBus - Error resilience: handler error does not break other handlers', () => {
  eventBus.reset();

  let secondCalled = false;
  eventBus.subscribe(DOMAIN_EVENTS.DAY_STARTED, () => {
    throw new Error('Exploding handler');
  });
  eventBus.subscribe(DOMAIN_EVENTS.DAY_STARTED, () => {
    secondCalled = true;
  });

  // Should not throw to caller
  eventBus.publish(DOMAIN_EVENTS.DAY_STARTED, { day: 1 });
  assert.equal(secondCalled, true);
});
