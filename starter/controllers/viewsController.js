exports.getOverview = (req, res) => {
  res.status(200).render('overview', {
    title: 'All Tours',
  }); //overview is the pug template we want to render on this url
};
exports.getTour = (req, res) => {
  res.status(200).render('tour', {
    tour: 'The Forest Hiker',
    user: 'Joseph', //locals in the pug file
  }); //base is the name of the filer we want to render
};
