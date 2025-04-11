const { Resend } = require("resend");
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send timeout notification emails to selected parents
 * @param {Array} selectedParentsEmails - Array of parent email addresses
 * @param {Object} childInfo - Information about the child who's timed out
 * @returns {Promise} - Promise resolving to the email send results
 */
const sendTimeOutNotification = async (selectedParentsEmails, childInfo) => {
  try {
    // Don't proceed if no parents are selected
    if (!selectedParentsEmails || selectedParentsEmails.length === 0) {
      return { success: false, message: "No parent emails provided" };
    }

    // Format child's name
    const childName = `${childInfo.first_name} ${childInfo.last_name}`;
    const timeOut = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
      .format(new Date())
      .replace(",", "");

    // Send emails to each parent
    const emailPromises = selectedParentsEmails.map(async (parentEmail) => {
      return resend.emails.send({
        from: "noreply@portal.saintlaurence.org.uk",
        to: parentEmail,
        subject: `${childName} has timed out`,
        html: `
          <p>Dear Parent/Guardian,</p>
          <p>This is to inform you that <strong>${childName}</strong> has timed out at <strong>${timeOut}</strong>.</p>
          <p>Thank you.</p>
        `,
      });
    });

    // Wait for all emails to be sent
    const results = await Promise.all(emailPromises);

    // Check for any errors
    const errors = results.filter((result) => result.error !== null);
    if (errors.length > 0) {
      console.error("Some emails failed to send:", errors);
      return {
        success: true,
        message: `${results.length - errors.length} of ${
          results.length
        } emails sent successfully`,
        errors,
      };
    }

    return {
      success: true,
      message: `All ${results.length} emails sent successfully`,
    };
  } catch (error) {
    console.error("Error sending timeout notifications:", error);
    throw new Error(`Failed to send timeout notifications: ${error.message}`);
  }
};

/**
 * Update timeout status in database and send notifications
 * @param {string} attendeeId - ID of the attendee being timed out
 * @param {Array} selectedParentsEmails - Array of parent emails to notify
 * @returns {Promise} - Promise resolving to the operation results
 */
const timeOutAttendee = async (attendeeId, selectedParentsEmails) => {
  try {
    const time_out = new Date().toISOString();

    // First check if record exists
    const { data: checkRecord } = await supabase
      .from("attendance")
      .select()
      .eq("id", attendeeId);

    if (!checkRecord || checkRecord.length === 0) {
      return {
        success: false,
        message: `No attendance record found with ID: ${attendeeId}`,
      };
    }

    // Then proceed with the update
    const { data: attendee, error } = await supabase
      .from("attendance")
      .update({ time_out })
      .eq("id", attendeeId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update attendance: ${error.message}`);
    }

    // Send email notifications if parent emails are provided
    let notificationResult = null;
    if (selectedParentsEmails && selectedParentsEmails.length > 0) {
      try {
        notificationResult = await sendTimeOutNotification(
          selectedParentsEmails,
          attendee
        );
        console.log("Email notification result:", notificationResult);
      } catch (emailError) {
        console.error("Error sending email notifications:", emailError);
        // Continue with the process even if email sending fails
      }
    }

    return {
      success: true,
      message: "Attendee timed out successfully",
      attendee,
      notification: notificationResult,
    };
  } catch (error) {
    console.error("Error in timeOutAttendee:", error);
    throw error;
  }
};

module.exports = {
  sendTimeOutNotification,
  timeOutAttendee,
};
