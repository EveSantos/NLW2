import {Request, Response} from 'express';

import db from '../database/connection';
import convertHourtoMinutes from '../util/convertHourtoMinutes';

interface ScheduleItem{
    week_day: number;
    from: string;
}

export default class ClassesController {
    async create(request:Request, response: Response ) {
        const {
            name,
            avatar,
            whatsapp,
            bio,
            subject,
            cost,
            schedule 
        } = request.body;
    
        const trx = await db.transaction()
    
        try{
            const insertedUsersIds = await trx('users').insert({
                name,
                avatar,
                whatsapp,
                bio,
            });
        
            const user_id = insertedUsersIds[0];
        
            const insertedClassesIds = await trx('classes').insert({
                subject,
                cost,
            })
        
            const class_id = insertedClassesIds[0];
        
            const classSchedule = schedule.map((scheduleItem: ScheduleItem) =>{        
                return{
                    class_id,
                    week_day: scheduleItem.week_day,
                    from: convertHourtoMinutes(scheduleItem.from),
                    to: convertHourtoMinutes(scheduleItem.from),
                };
            })
        
            await trx('class_schedule').insert(classSchedule);
        
            await trx.commit();
        
            return response.status(201).send();
        } catch (err) {
            await trx.rollback();
             
            return response.status(400).json({
                error: 'Unexpected error while creating new class'
            })
        }
    }
}