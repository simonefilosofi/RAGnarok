-- Enable Row Level Security on all tables
ALTER TABLE documents        ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks  ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages    ENABLE ROW LEVEL SECURITY;

-- ───────────────────────────────────────────
-- documents policies
-- ───────────────────────────────────────────
CREATE POLICY "users can view their own documents"
    ON documents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "users can insert their own documents"
    ON documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update their own documents"
    ON documents FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can delete their own documents"
    ON documents FOR DELETE
    USING (auth.uid() = user_id);

-- ───────────────────────────────────────────
-- document_chunks policies
-- ───────────────────────────────────────────
CREATE POLICY "users can view their own chunks"
    ON document_chunks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "users can insert their own chunks"
    ON document_chunks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can delete their own chunks"
    ON document_chunks FOR DELETE
    USING (auth.uid() = user_id);

-- ───────────────────────────────────────────
-- chat_sessions policies
-- ───────────────────────────────────────────
CREATE POLICY "users can view their own sessions"
    ON chat_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "users can insert their own sessions"
    ON chat_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update their own sessions"
    ON chat_sessions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can delete their own sessions"
    ON chat_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- ───────────────────────────────────────────
-- chat_messages policies
-- ───────────────────────────────────────────
CREATE POLICY "users can view their own messages"
    ON chat_messages FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "users can insert their own messages"
    ON chat_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can delete their own messages"
    ON chat_messages FOR DELETE
    USING (auth.uid() = user_id);
