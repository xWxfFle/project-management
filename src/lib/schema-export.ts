export type SchemaColumn = {
  table_schema: string;
  table_name: string;
  column_name: string;
  data_type: string;
};

export function schemaToJson(columns: SchemaColumn[]) {
  const tables: Record<
    string,
    { schema: string; name: string; columns: { name: string; type: string }[] }
  > = {};

  for (const col of columns) {
    const key = `${col.table_schema}.${col.table_name}`;
    if (!tables[key]) {
      tables[key] = {
        schema: col.table_schema,
        name: col.table_name,
        columns: [],
      };
    }
    tables[key].columns.push({
      name: col.column_name,
      type: col.data_type,
    });
  }
  return Object.values(tables);
}

export function schemaToPromptText(columns: SchemaColumn[]) {
  const lines = schemaToJson(columns).map((t) => {
    const cols = t.columns.map((c) => `${c.name} ${c.type}`).join(", ");
    return `Table ${t.schema}.${t.name}: ${cols}`;
  });
  return [
    ...lines,
    'Business terms: "продажи" = SUM(sales.amount), "категория" = categories.name',
    'Business terms: "sales" = SUM(sales.amount), "category" = categories.name',
  ].join("\n");
}
