import { Db } from 'mongodb';

export async function aggregateMagazzinoPantoni(db: Db) {
  const magazzino = await db.collection('magazzinoPantoni').find().toArray();
  const pantoni = await db.collection('pantoni').find().toArray();

  return magazzino.map((m) => {
    const pantoniGroup = pantoni.filter((p) => p.pantoneGroupId === m.pantoneGroupId);
    return {
      _id: m._id.toString(),
      pantoneGroupId: m.pantoneGroupId,
      nomePantone: pantoniGroup[0]?.nomePantone ?? '',
      tipo: m.tipo,
      dispMagazzino: m.dispMagazzino,
      ultimoUso: m.ultimoUso,
      noteMagazzino: m.noteMagazzino,
      count: pantoniGroup.length,
    };
  });
}
