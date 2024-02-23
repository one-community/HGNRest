const fs = require('fs');
const fsPromises = require('fs/promises');

const path = require('path');

const filename = 'BuildingUnits.json';
const currentFilePath = __filename;
const rootPath = path.resolve(path.dirname(currentFilePath), '../../../'); // Go up three levels to the root
const filepath = path.join(rootPath, filename);
const { readFile } = fs;
const { writeFile } = fs;

function bmInventoryTypeController(InvType, MatType, ConsType, ReusType, ToolType, EquipType) {
  async function fetchMaterialTypes(req, res) {
    try {
      MatType
        .find()
        .exec()
        .then((result) => res.status(200).send(result))
        .catch((error) => res.status(500).send(error));
    } catch (err) {
      res.json(err);
    }
  }

  const fetchToolTypes = async (req, res) => {
    try {
      ToolType
        .find()
        .exec()
        .then((result) => res.status(200).send(result))
        .catch((error) => res.status(500).send(error));
    } catch (err) {
      res.json(err);
    }
  };

  const fetchInvUnitsFromJson = async (req, res) => {
    try {
      // console.log(__dirname,filepath)
      readFile(filepath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading file:', err);
          res.status(500).send(err);
        }

        try {
          const jsonData = JSON.parse(data);
          res.status(200).send(jsonData);
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          res.status(500).send(parseError);
        }
      });
    } catch (err) {
      res.json(err);
    }
  };

  async function addMaterialType(req, res) {
    const {
      name,
      description,
      requestor: { requestorId },
    } = req.body;
    const unit = req.body.unit || req.body.customUnit;
    try {
      MatType
        .find({ name })
        .then((result) => {
          if (result.length) {
            res.status(409).send('Oops!! Material already exists!');
          } else {
            const newDoc = {
              category: 'Material',
              name,
              description,
              unit,
              createdBy: requestorId,
            };
            MatType
            .create(newDoc)
            .then((results) => {
                res.status(201).send(results);
                if (req.body.customUnit) {
                  try {
                    // Add new unit to json file : src\controllers\bmdashboard\BuildingUnits.json
                    const newItem = { unit: req.body.customUnit, category: 'Material' };
                    const newItemString = JSON.stringify(newItem, null, 2);
                    readFile(filepath, 'utf8', (err, data) => {
                      if (err) {
                        console.error('Error reading file:', err);
                        return;
                      }
                      // Remove the last array bracket and comma
                      const updatedContent = data.trim().replace(/\s*]$/, '');

                      // Add a comma and newline if the file is not empty
                      const separator = (updatedContent !== '') ? ',\n' : '';
                      const updatedFileContent = `${updatedContent}${separator}${newItemString}\n]`;

                      writeFile(filepath, updatedFileContent, 'utf8', (error) => {
                        if (error) {
                          console.error('Error writing to file:', error);
                        }
                      });
                    });
                  } catch (e) {
                    console.log(e);
                  }
                }
              })
            .catch((error) => {
              if (error._message.includes('validation failed')) {
                res.status(400).send(error);
              } else {
                res.status(500).send(error);
              }
            });
          }
        })
        .catch((error) => res.status(500).send(error));
      } catch (error) {
      res.status(500).send(error);
      }
    }

  async function fetchInventoryByType(req, res) {
    const { type } = req.params;
    let SelectedType = InvType;
    if (type === 'Material') {
      SelectedType = MatType;
    } else if (type === 'Consumable') {
      SelectedType = ConsType;
    } else if (type === 'Reusable') {
      SelectedType = ReusType;
    } else if (type === 'Tool') {
      SelectedType = ToolType;
    } else if (type === 'Equipment') {
      SelectedType = EquipType;
    }
    try {
      SelectedType
        .find()
        .exec()
        .then((result) => res.status(200).send(result))
        .catch((error) => res.status(500).send(error));
    } catch (err) {
      res.json(err);
    }
  }

  async function addEquipmentType(req, res) {
    const {
      name,
      desc: description,
      fuel: fuelType,
      requestor: { requestorId },
    } = req.body;
    try {
      EquipType
        .find({ name })
        .then((result) => {
          if (result.length) {
            res.status(409).send();
          } else {
            const newDoc = {
              category: 'Equipment',
              name,
              description,
              fuelType,
              createdBy: requestorId,
            };
            EquipType
            .create(newDoc)
            .then(() => res.status(201).send())
            .catch((error) => {
              if (error._message.includes('validation failed')) {
                res.status(400).send(error);
              } else {
                res.status(500).send(error);
              }
            });
          }
        })
        .catch((error) => res.status(500).send(error));
      } catch (error) {
      res.status(500).send(error);
      }
    }
    const fetchSingleInventoryType = async (req, res) => {
      const { invtypeId } = req.params;
      try {
        const result = await InvType.findById(invtypeId).exec();
        res.status(200).send(result);
      } catch (error) {
        res.status(500).send(error);
      }
    };

  const addInvUnit = async (req, res) => {
    // NOTE: category is default to be Material as no other item types need units
    const { unit, category = 'Material' } = req.body;
    if (typeof unit !== 'string' || unit.length === 0) {
      res.status(400).json('Invalid unit');
      return;
    }

    try {
      // read JSON file and parse it into an array
      const unitsJSON = await fsPromises.readFile(filepath, { encoding: 'utf8' });
      const unitsArray = JSON.parse(unitsJSON);

      // append new unit into array
      unitsArray.push({ unit, category });

      // save updated array into JSON file and rend it back
      await fsPromises.writeFile(filepath, JSON.stringify(unitsArray, null, ' '));

      res.status(201).send(unitsArray);
    } catch (err) {
      res.status(500).send(err);
      console.error(err);
    }
  };

  const deleteInvUnit = async (req, res) => {
    const { unit } = req.body;
    if (typeof unit !== 'string' || unit.length === 0) {
      res.status(400).json('Invalid unit');
      return;
    }

    try {
      // read JSON file and parse it into an array
      const unitsJSON = await fsPromises.readFile(filepath, { encoding: 'utf8' });
      const unitsArray = JSON.parse(unitsJSON);

      // if unit does not exist, send err response
      const index = unitsArray.findIndex(unitObject => unitObject.unit === unit);
      if (index === -1) {
        res.status(400).json('Unit does not exist');
        return;
      }

      // otherwise, remove unit
      const filteredUnits = unitsArray.filter(unitObject => unitObject.unit !== unit);

      // save updated array into JSON file and rend it back
      await fsPromises.writeFile(filepath, JSON.stringify(filteredUnits, null, ' '));
      res.status(200).send(filteredUnits);
    } catch (err) {
      res.status(500).send(err);
      console.error(err);
    }
  };

  const updateSingleInvType = async (req, res) => {
    const { type, invtypeId } = req.params;
    const { name, description } = req.body;

    // send back errors if required fields are missing
    if (name?.length === 0 || description?.length === 0) {
      res.status(400).json({ error: 'Name and description are required.' });
      return;
    }

    try {
      // find invType by id, and update name, description
      const updatedInvType = await InvType.findByIdAndUpdate(
        invtypeId,
        { name, description },
        { new: true, runValidators: true },
      );
      if (!updatedInvType) {
        res.status(404).json({ error: 'invTypeId does not exist' });
        return;
      }

      // send the updated list
      const updatedList = await InvType.find({ category: type });
      res.status(200).json(updatedList);
    } catch (error) {
      res.status(500).send(error);
    }
  };

  const deleteSingleInvType = async (req, res) => {
    const { type, invtypeId } = req.params;

    try {
      // delete invType with given id
      const deletedResult = await InvType.findByIdAndDelete(invtypeId);
      if (!deletedResult) {
        res.status(404).json({ error: 'invTypeId does not exist' });
        return;
      }

      // send the updated list
      const updatedList = await InvType.find({ category: type });
      res.status(200).json(updatedList);
    } catch (error) {
      res.status(500).send(error);
    }
  };

  return {
    fetchMaterialTypes,
    fetchToolTypes,
    addEquipmentType,
    fetchSingleInventoryType,
    addMaterialType,
    fetchInvUnitsFromJson,
    fetchInventoryByType,
    addInvUnit,
    deleteInvUnit,
    updateSingleInvType,
    deleteSingleInvType,
  };
}

module.exports = bmInventoryTypeController;
