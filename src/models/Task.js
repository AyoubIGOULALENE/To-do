const Joi = require('joi');
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['Finished', 'In progress', 'Postponed'], default: 'In progress' },
  priority: { type: Number, default: 0 },
  dueDate: { type: Date },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);
/* ----------------------------------------------------- */
const CreateTask = (obj) => {
    const schema = Joi.object({  
        title: Joi.string().required(),
        description: Joi.string(),
        status: Joi.string().default('In progress') ,
        priority: Joi.number().default(0),
        dueDate: Joi.date(),
})
return schema.validate(obj)
}

const UpdateTask = (obj) => {
    const schema = joi.object({  
        title: Joi.string().required(),
        description: Joi.string(),
        status: Joi.string().default('In progress') ,
        priority: Joi.number().default(0),
})

return schema.validate(obj)
}
/* ----------------------------------------------------- */

module.exports = {Task,UpdateTask,CreateTask}
