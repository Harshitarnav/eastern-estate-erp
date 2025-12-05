"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lead = exports.PropertyPreference = exports.CustomerRequirementType = exports.SiteVisitStatus = exports.LeadPriority = exports.LeadSource = exports.LeadStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const property_entity_1 = require("../../properties/entities/property.entity");
var LeadStatus;
(function (LeadStatus) {
    LeadStatus["NEW"] = "NEW";
    LeadStatus["CONTACTED"] = "CONTACTED";
    LeadStatus["QUALIFIED"] = "QUALIFIED";
    LeadStatus["NEGOTIATION"] = "NEGOTIATION";
    LeadStatus["WON"] = "WON";
    LeadStatus["LOST"] = "LOST";
    LeadStatus["ON_HOLD"] = "ON_HOLD";
})(LeadStatus || (exports.LeadStatus = LeadStatus = {}));
var LeadSource;
(function (LeadSource) {
    LeadSource["WEBSITE"] = "WEBSITE";
    LeadSource["WALK_IN"] = "WALK_IN";
    LeadSource["REFERRAL"] = "REFERRAL";
    LeadSource["SOCIAL_MEDIA"] = "SOCIAL_MEDIA";
    LeadSource["EMAIL"] = "EMAIL";
    LeadSource["PHONE"] = "PHONE";
    LeadSource["ADVERTISEMENT"] = "ADVERTISEMENT";
    LeadSource["BROKER"] = "BROKER";
    LeadSource["EXHIBITION"] = "EXHIBITION";
    LeadSource["NINETY_NINE_ACRES"] = "99ACRES";
    LeadSource["MAGICBRICKS"] = "MAGICBRICKS";
    LeadSource["OTHER"] = "OTHER";
})(LeadSource || (exports.LeadSource = LeadSource = {}));
var LeadPriority;
(function (LeadPriority) {
    LeadPriority["LOW"] = "LOW";
    LeadPriority["MEDIUM"] = "MEDIUM";
    LeadPriority["HIGH"] = "HIGH";
    LeadPriority["URGENT"] = "URGENT";
})(LeadPriority || (exports.LeadPriority = LeadPriority = {}));
var SiteVisitStatus;
(function (SiteVisitStatus) {
    SiteVisitStatus["NOT_SCHEDULED"] = "NOT_SCHEDULED";
    SiteVisitStatus["SCHEDULED"] = "SCHEDULED";
    SiteVisitStatus["PENDING"] = "PENDING";
    SiteVisitStatus["DONE"] = "DONE";
    SiteVisitStatus["CANCELLED"] = "CANCELLED";
})(SiteVisitStatus || (exports.SiteVisitStatus = SiteVisitStatus = {}));
var CustomerRequirementType;
(function (CustomerRequirementType) {
    CustomerRequirementType["END_USER"] = "END_USER";
    CustomerRequirementType["INVESTOR"] = "INVESTOR";
    CustomerRequirementType["BOTH"] = "BOTH";
})(CustomerRequirementType || (exports.CustomerRequirementType = CustomerRequirementType = {}));
var PropertyPreference;
(function (PropertyPreference) {
    PropertyPreference["FLAT"] = "FLAT";
    PropertyPreference["DUPLEX"] = "DUPLEX";
    PropertyPreference["PENTHOUSE"] = "PENTHOUSE";
    PropertyPreference["VILLA"] = "VILLA";
    PropertyPreference["PLOT"] = "PLOT";
    PropertyPreference["COMMERCIAL"] = "COMMERCIAL";
    PropertyPreference["ANY"] = "ANY";
})(PropertyPreference || (exports.PropertyPreference = PropertyPreference = {}));
let Lead = class Lead {
    get firstName() {
        return this.fullName?.split(' ')[0] || '';
    }
    get lastName() {
        const parts = this.fullName?.split(' ') || [];
        return parts.slice(1).join(' ') || '';
    }
    get phone() {
        return this.phoneNumber;
    }
    get notes() {
        return this.followUpNotes;
    }
};
exports.Lead = Lead;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Lead.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lead_code', length: 50, unique: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Lead.prototype, "leadCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'full_name', length: 255 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Lead.prototype, "fullName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Lead.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone_number', length: 20 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Lead.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'alternate_phone', length: 20, nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "alternatePhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_line1', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: LeadStatus,
        default: LeadStatus.NEW,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Lead.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: LeadSource,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Lead.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: LeadPriority,
        default: LeadPriority.MEDIUM,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Lead.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'property_id', type: 'uuid', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Lead.prototype, "propertyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => property_entity_1.Property, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'property_id' }),
    __metadata("design:type", property_entity_1.Property)
], Lead.prototype, "property", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tower_id', type: 'uuid', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Lead.prototype, "towerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'flat_id', type: 'uuid', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Lead.prototype, "flatId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'interested_in', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "interestedPropertyTypes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CustomerRequirementType,
        default: CustomerRequirementType.END_USER,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Lead.prototype, "requirementType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PropertyPreference,
        default: PropertyPreference.FLAT,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Lead.prototype, "propertyPreference", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Lead.prototype, "budgetMin", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Lead.prototype, "budgetMax", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'preferred_location', length: 100, nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "preferredLocation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Lead.prototype, "requirements", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "tentativePurchaseTimeframe", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'timeline', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Lead.prototype, "expectedPurchaseDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_contact_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Lead.prototype, "lastContactedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'follow_up_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Lead.prototype, "nextFollowUpDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "followUpNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_follow_up_feedback', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "lastFollowUpFeedback", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Lead.prototype, "totalFollowUps", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Lead.prototype, "sendFollowUpReminder", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Lead.prototype, "reminderSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Lead.prototype, "reminderSentAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_to', type: 'varchar', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Lead.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Lead.prototype, "assignedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'assigned_to' }),
    __metadata("design:type", user_entity_1.User)
], Lead.prototype, "assignedUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assignment_history', type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], Lead.prototype, "assignmentHistory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Lead.prototype, "isQualified", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Lead.prototype, "isFirstTimeBuyer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Lead.prototype, "hasExistingProperty", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Lead.prototype, "needsHomeLoan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Lead.prototype, "hasApprovedLoan", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "currentOccupation", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Lead.prototype, "annualIncome", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "campaignName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "utmSource", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "utmMedium", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "utmCampaign", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Lead.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "referredBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "referralName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "referralPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'has_site_visit', type: 'boolean', default: false, nullable: true }),
    __metadata("design:type", Boolean)
], Lead.prototype, "hasSiteVisit", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'site_visit_status',
        type: 'enum',
        enum: SiteVisitStatus,
        default: SiteVisitStatus.NOT_SCHEDULED,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Lead.prototype, "siteVisitStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'site_visit_time', type: 'time', nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "siteVisitTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'site_visit_feedback', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "siteVisitFeedback", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_site_visits', type: 'int', default: 0, nullable: true }),
    __metadata("design:type", Number)
], Lead.prototype, "totalSiteVisits", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_site_visit_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Lead.prototype, "lastSiteVisitDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Lead.prototype, "totalCalls", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Lead.prototype, "totalEmails", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Lead.prototype, "totalMeetings", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Lead.prototype, "lastCallDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Lead.prototype, "lastEmailDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Lead.prototype, "lastMeetingDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'converted_to_customer', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "convertedToCustomerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Lead.prototype, "convertedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "lostReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Lead.prototype, "lostAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Boolean)
], Lead.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Lead.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Lead.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "updatedBy", void 0);
exports.Lead = Lead = __decorate([
    (0, typeorm_1.Entity)('leads'),
    (0, typeorm_1.Index)(['status', 'isActive']),
    (0, typeorm_1.Index)(['assignedTo', 'status'])
], Lead);
//# sourceMappingURL=lead.entity.js.map