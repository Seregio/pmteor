Meteor.startup(() => {

  // Bus system - event monitoring
  pm2.launchBus(Meteor.bindEnvironment((err, bus) => {
    if (_.isNull(err)) {

      // PROCESS ALL EVENTS
      bus.on('process:event', Meteor.bindEnvironment((query) => {
        const { PORT, name } = query.process;

        // IS ONLINE EVENT THEN UPDATE APPLICATION
        if (_.isEqual(query.event, 'online')) {
          Applications.update({
            bundleId: name
          }, {
            $set: {
              port: PORT,
              status: STATUS_ALLOWED_VALUES[2]
            }
          });
        }
      }));

      // IF ERROR THEN ON EVENT
      bus.on('log:err', Meteor.bindEnvironment((query) => {

        // UPDATE APPLICATION
        Applications.update({
          bundleId: query.process.name
        }, {
          $set: { status: STATUS_ALLOWED_VALUES[4] /* ERRORED */ },
          $push: {
            logs: {
              createdAt: new Date(),
              type: STATUS_ALLOWED_VALUES[4], /* ERRORED */
              data: query.data // error data.
            }
          }
        });
      }));
    }
  }));
});